'use strict';

const HttpErrors = require('http-errors');
const app = require('../../server/server');
const LessonEventStateEnum = require('../enums/lesson-event.state.enum');
const CourseTeacherChoiceEnum = require('../enums/course.teacher-choice.enum');
const container = require('../conf/configure-container');

/** @type LessonService */
const lessonService = container.resolve('lessonService');
/** @type CustomerService */
const customerService = container.resolve('customerService');

/** @type MailNotificationService */
const mailNotificationService = container.resolve('mailNotificationService');

/** @type GoogleApiService */
const googleApiService = container.resolve('googleApiService');

/** @type ActivityLogService */
const activityLogService = container.resolve('activityLogService');

module.exports = function(LessonEventModel) {

  /**
   * The hook before lesson creation
   */
  LessonEventModel.beforeRemote('create',  async function(ctx) {

    const courseProgressId = ctx.args.data.courseProgressId;

    return lessonService.isEnoughtLessonEventsBalance(courseProgressId)
      .then(value => {
        if (value) {

          const courseProgressModel = app.models.CourseProgress;

          return courseProgressModel.findById(courseProgressId, {include: ['Course', 'PrimaryTeacher']})
            .then(result => {
              // we need to convert to JSON when include something
              return result.toJSON();
            });
        } else {
          throw new HttpErrors.BadRequest('There is not enough lessons on customer\'s balance!');
        }
      })
      .then(courseProgress => {

        if (courseProgress.Course.teacherChoice === CourseTeacherChoiceEnum.MANUAL) {
          // assigning teacher right away

          ctx.args.data.teacherId = courseProgress.PrimaryTeacher.id;
          // for logging purposes
          ctx.args.data.teacherInstance = courseProgress.PrimaryTeacher;
        }

        return true;
      })
      .catch(err => {

        // Break execution
        if (err.constructor.name === 'ClientError' || err.constructor.name === 'ServerError') {
          throw err;
        } else if (err.constructor.name === 'Error') {
          throw new HttpErrors.InternalServerError(err.message, err);
        } else {
          throw new HttpErrors.InternalServerError(err);
        }
      });
  });

  /**
   * The hook after lesson creation
   */
  LessonEventModel.afterRemote('create', async function(ctx, instance) {

    const initiatorId = customerService.getCustomerIdByToken(ctx.req.accessToken);

    return Promise.all(
      [
        lessonService.getLessonEventsBalance(instance.courseProgressId),
        lessonService.decrementLessonEventsBalance(instance.courseProgressId)
      ]).then(results => {

      const [previousBalance, currentBalance] = results;
      return activityLogService.logBalanceSpend(
        initiatorId,
        instance.studentId,
        instance.id,
        previousBalance,
        currentBalance
      );
    }).then(() => {
      return activityLogService.logLessonEventCreate(
        initiatorId,
        instance.studentId,
        instance.id
      );
    }).then(() => {
      if (instance.teacherInstance) {

        return activityLogService.logLessonEventTeacherAssignement(
          initiatorId,
          instance.studentId,
          instance.id,
          instance.teacherInstance,
        );
      } else {
        return true;
      }
    }).then(() => {
      console.log('Try to notify Teacher');

      return googleApiService.createLessonCalendarEvent(instance.id, instance.teacherId, instance.studentId)
        .then(res => {
          console.log(res, 'result teach');
          if (!res) {
            console.log('Teacher has not configured API yet, exiting...')
          } else {
            instance.teacherGoogleCalendarEventId = res.id;
            console.log('The new lesson event has been written for Teacher!:)')
          }
        });
    }).then(() => {
      console.log('Try to notify Student');

      return googleApiService.createLessonCalendarEvent(instance.id, instance.studentId, instance.studentId)
        .then(res => {
          console.log(res, 'result stud');
          if (!res) {
            console.log('Student has not configured API yet, exiting...')
          } else {
            instance.studentGoogleCalendarEventId = res.id;
            console.log('The new lesson event has been written for Student!:)')
          }
        });

    }).then(() => {

      console.log('ids found', instance.teacherGoogleCalendarEventId, instance.studentGoogleCalendarEventId);

      if (instance.teacherGoogleCalendarEventId || instance.studentGoogleCalendarEventId) {
        return instance.save();
      } else {
        return true;
      }
    }).then(() => {
      return mailNotificationService.notifyTeacherLessonEventCreated(instance.id);

    }).catch(err => {
      console.error('An error occurred', err);
    });
  });

  // If there is two hooks on the same operation, will be executed both

  /**
   * The hook before updating of lesson
   */
  LessonEventModel.beforeRemote('prototype.patchAttributes', async function(ctx, instance) {


    // !!! in prototype.patchAttributes, there is no ctx.args.id, there is ctx.ctorArgs.id!!!
    const id = ctx.ctorArgs.id;

    return LessonEventModel.findById(id)
      .then(exLesson => {

          if (exLesson) {
            // for logging purposes
            ctx.args.data.previousInstance = exLesson;
          } else {
            throw new HttpErrors.InternalServerError('Could not find the lesson event');
          }

          if (!ctx.args.data.state) {
            // not process forward
            return true;
          } else {
            const newState = parseInt(ctx.args.data.state);
            if (newState === LessonEventStateEnum.STARTED && exLesson.state === LessonEventStateEnum.PLANNED) {
              console.log('User trying to start event lesson; Checking, if this lesson has the teacher');
              if (!ctx.args.data.teacherId && !exLesson.teacherId) {
                return customerService.findFreeTeacher()
              } else {
                console.log('Lesson already has a teacher');
                return true;
              }
            } else {

              return true;
            }
          }
        })
      .then(value => {
        if(value === true) {
          return true;
        } else {
          const teacher = value;
          if (teacher) {
            console.log('found', teacher.id);
            ctx.args.data.teacherId = teacher.id;
            // for logging purposes
            ctx.args.data.teacherInstance = teacher;
          } else {
            throw new HttpErrors.BadRequest('Could not find a free teacher for this lessonEvent');
          }
        }
      }).catch(err => {
        // Break execution
        if (err.constructor.name === 'ClientError' || err.constructor.name === 'ServerError') {
          throw err;
        } else if (err.constructor.name === 'Error') {
          throw new HttpErrors.InternalServerError(err.message, err);
        } else {
          throw new HttpErrors.InternalServerError(err);
        }

      });
  });

  /**
   * Hook after update of lesson
   */
  LessonEventModel.afterRemote('prototype.patchAttributes', async function(ctx, instance) {

    // TODO: probably, split on two hooks, one for (refund) and state change logging, 2nd for teacher change logging

    console.log('PI?', ctx.args.data);

    // should be presented always
    const previousInstance = ctx.args.data.previousInstance;
    // may be not presented
    const teacherInstance = ctx.args.data.teacherInstance;
    const initiatorId = customerService.getCustomerIdByToken(ctx.req.accessToken);

    return new Promise((resolve) => {

      // when creating a promise you always should resolve

      if (previousInstance.state !== instance.state) {
        console.log('State has been changed');

        if (instance.state === LessonEventStateEnum.CANCELED) {

          resolve(
            Promise.all([
              lessonService.getLessonEventsBalance(instance.courseProgressId),
              lessonService.incrementLessonEventsBalance(instance.courseProgressId)
            ]).then(results => {

              const [previousBalance, currentBalance] = results;
              console.log('the balance was returned to previous state');

              // logging refund
              return activityLogService.logBalanceRefund(
                initiatorId,
                instance.studentId,
                instance.id,
                previousBalance,
                currentBalance
              );
            }).then(() => {
              if(instance.studentGoogleCalendarEventId) {
                console.log('There\'s student event id, trying to delete lesson event from student google calendar');
                return googleApiService.deleteLessonCalendarEvent(instance.studentGoogleCalendarEventId, instance.studentId)
              } else {
                return true;
              }
            }).then(() => {
              if(instance.teacherGoogleCalendarEventId) {
                console.log('There\'s teacher event id, try to delete lesson event from teacher\'s google calendar');
                return googleApiService.deleteLessonCalendarEvent(instance.teacherGoogleCalendarEventId, instance.teacherId)
              } else {
                return true;
              }
            })
          );
        } else {
          resolve(true);
        }
      } else {
        resolve(false);
      }
    })
      .then(value => {
        console.log('here', value);
        if (value) {
          console.log('Value indicates that there was state change');

          // logging state change
          return activityLogService.logLessonEventStateChange(
            initiatorId,
            instance.studentId,
            instance.id,
            ctx.args.data.previousInstance.state,
            instance.state,
            instance.cancelationReason)
        } else {
          return value;
        }
      })
      .then(() => {
        if (previousInstance.teacherId !== instance.teacherId && teacherInstance) {

          // loggin teacher change
          console.log('Teacher changed, logging');
          return activityLogService.logLessonEventTeacherAssignement(
            initiatorId,
            instance.studentId,
            instance.id,
            teacherInstance);
        } else {
          return false;
        }
      })
      .catch(err => {
        console.error('An error occurred', err);
      });

  });

  /**
   * Nearest lesson for student
   *
   * @param studentId
   * @param include
   * @returns {Promise<any>}
   */
  LessonEventModel.nearestStudentLessonEvent = function(studentId, include) {
    return new Promise((resolve, reject) => {
      lessonService.getNearestStudentLessonEvent(studentId, include)
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

  /**
   * Nearest lesson for teacher
   *
   * @param teacherId
   * @param include
   * @returns {Promise<any>}
   */
  LessonEventModel.nearestTeacherLessonEvent = function(teacherId, include) {
    return new Promise((resolve, reject) => {
      lessonService.getNearestTeacherLessonEvent(teacherId, include)
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

  /**
   * Finds the lesson events with status "started" or "planned", and that time is gone, and assigns the status "completed"
   *
   * @returns {Promise<any>}
   */
  LessonEventModel.completeLessonEvents = function() {
    return lessonService.completeLessonEvents();
  };

  LessonEventModel.remoteMethod('nearestStudentLessonEvent', {
    accepts: [{arg: 'studentId', type: 'number', required: true},{arg: 'include', type: 'array'}],
    http: {verb: 'get'},
    returns: { arg: 'data', type: 'LessonEvent', root: true},
  });

  LessonEventModel.remoteMethod('nearestTeacherLessonEvent', {
    accepts: [{arg: 'teacherId', type: 'number', required: true},{arg: 'include', type: 'array'}],
    http: {verb: 'get'},
    returns: { arg: 'data', type: 'LessonEvent', root: true},
  });

  LessonEventModel.remoteMethod('completeLessonEvents', {
    http: {verb: 'put'},
    returns: { arg: 'result', type: 'boolean'},
  });

};
