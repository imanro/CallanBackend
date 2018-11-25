'use strict';

const HttpErrors = require('http-errors');

var LessonEventState = require('../enums/lesson-event.state.enum');
const container = require('../conf/configure-container');

/** @type LessonEventService */
const lessonEventService = container.resolve('lessonEventService');
/** @type UserService */
const userService = container.resolve('userService');

/** @type ActivityLogService */
const activityLogService = container.resolve('activityLogService');

module.exports = function(LessonEventModel) {

  LessonEventModel.beforeRemote('create',  async function(ctx) {

    return new Promise((resolve, reject) => {
      const courseProgressId = ctx.args.data.courseProgressId;

      lessonEventService.isEnoughtLessonEventsBalance(courseProgressId).then(value => {

        if(value) {

          console.log('executed this');

          userService.findFreeTeacher()
            .then(teacher => {

                if (teacher) {
                  console.log('found', teacher.id);
                  ctx.args.data.teacherId = teacher.id;

                  // for logging purposes
                  ctx.args.data.teacherInstance = teacher;
                  resolve();
                } else {
                  console.warn('An error occured:', err);
                  reject(new HttpErrors.BadRequest('Could not find a free teacher for this lessonEvent', err));
                }

              }, err => {
                console.warn('An error occured:', err);
                reject(new HttpErrors.BadRequest('Some error occurred while assigning the new teacher for lessonEvent', err));
              }
            );

        } else {
          reject(new HttpErrors.BadRequest('There is not enough lessons on customer\'s balance!'));
        }

      }, err => {
        console.warn('An error occured:', err);
        reject(new HttpErrors.BadRequest('Something went wrong during the lesson balance checking', err));
      })
    });
  });

  // CHECK, will the two same hooks work or not
  /*
  LessonEventModel.beforeRemote('create', async function(ctx) {
    return new Promise((resolve) => {
      console.log('Also executed');
      resolve();
    });

  });
  */

  LessonEventModel.afterRemote('create', async function(ctx, instance) {

    return new Promise((resolve) => {

      const teacherInstance = ctx.args.data.teacherInstance;

      lessonEventService.getLessonEventsBalance(instance.courseProgressId)
        .then(previousBalance => {

          lessonEventService.decrementLessonEventsBalance(instance.courseProgressId)
            .then(currentBalance => {
              console.log('Balance decremented');
              const initiatorId = userService.getUserIdByToken(ctx.req.accessToken);
              activityLogService.logBalanceSpend(
                initiatorId,
                instance.studentId,
                instance.id,
                previousBalance,
                currentBalance
              )
                .then(() => {

                  if(instance.teacherId) {
                    activityLogService.logLessonEventTeacherAssignement(
                      initiatorId,
                      instance.studentId,
                      instance.id,
                      teacherInstance,
                    ).then(() => {
                      resolve();
                    }, err => {
                      console.warn('An error occurred during the log creation', err);
                      resolve();
                    });
                  } else {
                    resolve();
                  }

                }, err => {
                  console.warn('An error occurred during the log creation', err);
                  resolve();
                });

            }, err => {
              console.warn('Error occurred', err);
              resolve();
            });

        }, err => {
          console.warn('An error occurred', err);
        });
    });
  });

  LessonEventModel.beforeRemote('replaceById', async function(ctx) {

    return new Promise((resolve, reject) => {

      LessonEventModel.findById(ctx.args.id).then(exLesson => {

        if (!exLesson) {
          reject('Could\'nt find the lesson event');
        }


        if (!ctx.args.data.state) {
          resolve();
        }

        // for logging purposes
        ctx.args.data.previousInstance = exLesson;
        const newState = parseInt(ctx.args.data.state);

        if (newState === LessonEventState.STARTED && exLesson.state === LessonEventState.PLANNED) {

          console.log('User trying to start event lesson; Checking, if this lesson has the teacher');

          if (!ctx.args.data.teacherId && !exLesson.teacherId) {
            console.log('This lesson didn\'t have the teacher. Try to find free one');

            // NOTE: now we assign teacher during lessonEvent creation! (same code is executed)
            userService.findFreeTeacher()
              .then(teacher => {

                  if (teacher) {
                    console.log('found', teacher.id);
                    ctx.args.data.teacherId = teacher.id;

                    // for logging purposes
                    ctx.args.data.teacherInstance = teacher;
                    resolve();
                  } else {
                    console.warn('An error occured:', err);
                    reject(new HttpErrors.BadRequest('Could not find a free teacher for this lessonEvent', err));
                  }

                }, err => {
                  console.warn('An error occured:', err);
                  reject(new HttpErrors.BadRequest('Some error occurred while assigning the new teacher for lessonEvent', err));
                }
              );

          } else {
            resolve();
          }
        } else {
          resolve();
        }


      }, err => {
        console.warn('An error occured:', err);
        reject(new HttpErrors.BadRequest('Something went wrong, could not find an existing lesson', err));
      });
    });
  });

  LessonEventModel.afterRemote('replaceById', async function(ctx, instance) {
    return new Promise((resolve) => {
      if(ctx.args.data.previousInstance) {

        const previousInstance = ctx.args.data.previousInstance;
        const teacherInstance = ctx.args.data.teacherInstance;

        if(previousInstance.state !== instance.state) {
          console.log('State has been changed');

          const initiatorId = userService.getUserIdByToken(ctx.req.accessToken);

          // Loggin the state change for the lesson
          activityLogService.logLessonEventStateChange(
            initiatorId,
            instance.studentId,
            instance.id,
            ctx.args.data.previousInstance.state,
            instance.state
          ).then(() => {

            console.log('Logged');

            if(previousInstance.teacherId !== instance.teacherId && teacherInstance) {
              console.log('Teacher changed, logging');
              activityLogService.logLessonEventTeacherAssignement(
                initiatorId,
                instance.studentId,
                instance.id,
                teacherInstance,

              ).then(() => {
                resolve();
              }, err => {
                console.warn('An error occurred during the log creation', err);
                resolve();
              });
            } else {
              console.log('Teacher is not changed');
              resolve();
            }

          }, err => {
            console.warn('An error occurred during the log creation', err);
            resolve();
          });

        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });

  LessonEventModel.nearestStudentLessonEvent = function(studentId, include) {
    return new Promise((resolve, reject) => {
      lessonEventService.getNearestStudentLessonEvent(studentId, include)
        .then(result => {
          if(result) {
            resolve(result);
          } else {
            reject(new HttpErrors.NotFound('Such lesson event is not found'));
          }
        }, err => {
          reject(err);
        })
    });


  };

  LessonEventModel.remoteMethod('nearestStudentLessonEvent', {
    accepts: [{arg: 'studentId', type: 'number', required: true},{arg: 'include', type: 'array'}],
    http: {verb: 'get'},
    returns: { arg: 'data', type: 'LessonEvent', root: true},
  });
};
