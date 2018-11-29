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

  /**
   * The hook before lesson creation
   */
  LessonEventModel.beforeRemote('create',  async function(ctx) {

    const courseProgressId = ctx.args.data.courseProgressId;

    return lessonEventService.isEnoughtLessonEventsBalance(courseProgressId)
      .then(value => {
        if (value) {
          return userService.findFreeTeacher();
        } else {
          throw new HttpErrors.BadRequest('There is not enough lessons on customer\'s balance!');
        }
      })
      .then(teacher => {
        if (teacher) {
          console.log('found', teacher.id);
          ctx.args.data.teacherId = teacher.id;
          // for logging purposes
          ctx.args.data.teacherInstance = teacher;
          return true;
        } else {
          throw new HttpErrors.BadRequest('Could not find a free teacher for this lessonEvent');
        }
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

    const initiatorId = userService.getUserIdByToken(ctx.req.accessToken);

    return Promise.all(
      [
        lessonEventService.getLessonEventsBalance(instance.courseProgressId),
        lessonEventService.decrementLessonEventsBalance(instance.courseProgressId)
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
    }).catch(err => {
      console.error('An error occurred', err);
    });
  });

  // If there is two hooks on the same operation, will be executed both

  /**
   * The hook before updating of lesson
   */
  LessonEventModel.beforeRemote('replaceById', async function(ctx) {

    return LessonEventModel.findById(ctx.args.id)
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
            if (newState === LessonEventState.STARTED && exLesson.state === LessonEventState.PLANNED) {
              console.log('User trying to start event lesson; Checking, if this lesson has the teacher');
              if (!ctx.args.data.teacherId && !exLesson.teacherId) {
                return userService.findFreeTeacher()
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
  LessonEventModel.afterRemote('replaceById', async function(ctx, instance) {

    // TODO: probably, split on two hooks, one for (refund) and state change logging, 2nd for teacher change logging

    // should be presented always
    const previousInstance = ctx.args.data.previousInstance;
    // may be not presented
    const teacherInstance = ctx.args.data.teacherInstance;
    const initiatorId = userService.getUserIdByToken(ctx.req.accessToken);

    return new Promise((resolve) => {

      // when creating a promise you always should resolve

      if (previousInstance.state !== instance.state) {
        console.log('State has been changed');

        if (instance.state === LessonEventState.CANCELED) {

          resolve(
            Promise.all([
              lessonEventService.getLessonEventsBalance(instance.courseProgressId),
              lessonEventService.incrementLessonEventsBalance(instance.courseProgressId)
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

  /**
   * Nearest lesson for teacher
   *
   * @param teacherId
   * @param include
   * @returns {Promise<any>}
   */
  LessonEventModel.nearestTeacherLessonEvent = function(teacherId, include) {
    return new Promise((resolve, reject) => {
      lessonEventService.getNearestTeacherLessonEvent(teacherId, include)
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
    return lessonEventService.completeLessonEvents();
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
