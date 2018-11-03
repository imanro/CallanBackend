'use strict';

const HttpErrors = require('http-errors');

var LessonEventState = require('../enums/lesson-event.state');
var RoleName = require('../enums/role.name');

module.exports = function(LessonEvent) {

  LessonEvent.beforeRemote('create', function(ctx, instance, next) {
    const CourseProgress = LessonEvent.app.models.CourseProgress;
    const courseProgressId = ctx.args.data.courseProgressId;

    if (courseProgressId) {

      CourseProgress.findById(courseProgressId, function(err, courseProgress) {
        if (err) {
          next(err);
        }

        if (courseProgress.lessonEventsBalance <= 0) {
          next(new HttpErrors.BadRequest('There is not enough lessons on customer\'s balance!'));
        } else {
          next();
        }

      });
    } else {
      next();
    }
  });

  LessonEvent.afterRemote('create', function(ctx, instance, next) {

    const CourseProgress = LessonEvent.app.models.CourseProgress;

    const courseProgressId = instance.courseProgressId;

    if (courseProgressId) {

      CourseProgress.findById(courseProgressId, function(err, courseProgress) {
        if (err) {
          next(err);
        }

        courseProgress.lessonEventsBalance -= 1;

        courseProgress.save(function() {
          console.log('lessonEventsBalance decremented!');
          next();
        });

      });
    } else {
      next();
    }
  });

  LessonEvent.beforeRemote('replaceById', function(ctx, instance, next) {

    const Role = LessonEvent.app.models.Role;
    const Customer = LessonEvent.app.models.Customer;
    const RoleMapping = LessonEvent.app.models.RoleMapping;

    var id = ctx.args.id;

    // find the previous instance of the model with such id
    LessonEvent.findById(id, function(err, exLesson) {

      if (err) {
        next(err);
      }

      if(exLesson) {
        console.log('Found:', exLesson);

        if (ctx.args.data.state) {
          var newState = parseInt(ctx.args.data.state);
          if (newState === LessonEventState.STARTED && exLesson.state === LessonEventState.PLANNED) {
            console.log('User trying to start event lesson; Checking, if this lesson has the teacher');

            if (!ctx.args.data.teacherId && !exLesson.teacherId) {
              console.log('This lesson has\'nt teacher. Try to find free one');

              // searching for teacher role id:
              Role.findOne({where: {name: RoleName.TEACHER}}, function(err, role) {
                if (err) {
                  next(err);
                }

                if (role) {
                  console.log('Role found,', role.id);

                  // find role-mapping instances for this role
                  RoleMapping.findOne({
                    where: {roleId: role.id, principalType: 'USER'},
                    order: 'id ASC'
                  }, function(err, mapping) {
                    if (err) {
                      next(err);
                    }

                    if (mapping && mapping.principalId) {
                      console.log('found,', mapping);

                      Customer.findOne({where: {id: mapping.principalId}}, function(err, customer) {

                        if (customer) {
                          console.log('At last, we found the customer', customer);
                          console.log('Setting the teacherId for this lesson event');
                          ctx.args.data.teacherId = customer.id;
                        }

                        next();
                      });
                    } else {
                      next();
                    }
                  });
                } else {
                  next();
                }
              });
            }
          } else {
            next();
          }
        } else {
          next();
        }
      } else {
        next();
      }
    });
  });
};
