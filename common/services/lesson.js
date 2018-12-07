'use strict';

var app = require('../../server/server');

var LessonEventState = require('../enums/lesson-event.state.enum');

class LessonService {

  assignLessonEventEndTime(lessonEvents) {
    for (let i = 0; i < lessonEvents.length; i++) {
      const lessonEvent = lessonEvents[i];

      if (lessonEvent.startTime) {
        lessonEvent._endTime = new Date();
        lessonEvent._endTime.setTime(lessonEvent.startTime.getTime() + (lessonEvent.duration * 60000));
        console.log('created', lessonEvent.startTime, lessonEvent._endTime);
      }
    }
  }

  isHourOfLessonEvent(hour, lessonEvent) {
    return lessonEvent.startTime.getHours() <= hour && lessonEvent._endTime.getHours() > hour;
  }

  isHourOfLessonEvents(hour, lessonEvents) {

    for (const i in lessonEvents) {
      if (lessonEvents.hasOwnProperty(i)) {
        const lessonEvent = lessonEvents[i];
        if (this.isHourOfLessonEvent(hour, lessonEvent)) {
          return true;
        }
      }
    }

    return false;
  }

  filterLessonEventsForDay(lessonEvents, checkDate) {
    return lessonEvents.filter(function(row) {
      return row.startTime &&
        row.startTime.getFullYear() === checkDate.getFullYear() &&
        row.startTime.getMonth() === checkDate.getMonth() &&
        row.startTime.getDate() === checkDate.getDate();
    });
  }

  isEnoughtLessonEventsBalance(progressId) {

    const CourseProgressModel = app.models.CourseProgress;

    return new Promise((resolve, reject) => {

      CourseProgressModel.findById(progressId)
        .then(courseProgress => {
          if(courseProgress) {
            if (courseProgress.lessonEventsBalance <= 0) {
              resolve(false);
            } else {
              resolve(true);
            }
          } else {
            reject('Could not find the CourseProgress by id')
          }
        }, err => {
          reject(err);
        });

    });
  }


  getLessonEventsBalance(progressId) {

    const CourseProgressModel = app.models.CourseProgress;

    return new Promise((resolve, reject) => {

      CourseProgressModel.findById(progressId)
        .then(courseProgress => {
          if(courseProgress) {
            resolve(courseProgress.lessonEventsBalance);
          } else {
            reject('Could not find the CourseProgress by id')
          }
        }, err => {
          reject(err);
        });

    });
  }

  decrementLessonEventsBalance(progressId) {
    return new Promise((resolve, reject) => {
      const CourseProgress = app.models.CourseProgress;

      if (progressId) {

        CourseProgress.findById(progressId)
          .then(courseProgress => {
            courseProgress.lessonEventsBalance -= 1;

            courseProgress.save(function() {
              console.log('lessonEventsBalance decremented! Now it is', courseProgress.lessonEventsBalance);
              resolve(courseProgress.lessonEventsBalance);
            });

          }, err => {
            reject(err);
          });
      } else {
        reject('There is no course progress assigned with this lesson event :(');
      }
    });
  }

  incrementLessonEventsBalance(progressId) {
    return new Promise((resolve, reject) => {
      const CourseProgress = app.models.CourseProgress;

      if (progressId) {

        CourseProgress.findById(progressId)
          .then(courseProgress => {
            courseProgress.lessonEventsBalance += 1;

            courseProgress.save(function() {
              console.log('lessonEventsBalance incremented! Now it is', courseProgress.lessonEventsBalance);
              resolve(courseProgress.lessonEventsBalance);
            });

          }, err => {
            reject(err);
          });
      } else {
        reject('There is no course progress assigned with this lesson event :(');
      }
    });
  }

  assignLessonEventTeacher(lessonEvent) {
    // find the previous instance of the model with such id

    return new Promise((resolve, reject) => {
      if (lessonEvent.teacherId) {
        // lesson already has the teacher
        resolve();
      }
      const container = require('../conf/configure-container');

      /** @type CustomerService */
      const customerService = container.resolve('customerService');

      customerService.findFreeTeacher()
        .then(teacher => {

          if (teacher) {
            console.log('Found teacher:', teacher.id, ', ', teacher.email);
            lessonEvent.teacherId = teacher.id;
            resolve(true);
          } else {
            resolve(false);
          }

        }, err => {
          reject(err);
        });
    });
  }

  getNearestStudentLessonEvent(studentId, include) {
    // TODO: obey lesson event length, not only 1 hour. Native queries :(
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 1);

    if (!include) {
      include = [];
    }

    console.log(include);

    const LessonEventModel = app.models.LessonEvent;

    return LessonEventModel.findOne({
      where: {and: [{studentId: studentId}, {startTime: {'gte': currentDate}},
          {state: {inq: [LessonEventState.PLANNED, LessonEventState.STARTED]}}]},
      order: ['startTime ASC'],
      include: include,
    });
  }

  getNearestTeacherLessonEvent(teacherId, include) {
    // TODO: obey lesson event length, not only 1 hour. Native queries :(
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 1);

    if (!include) {
      include = [];
    }

    console.log(include);

    const LessonEventModel = app.models.LessonEvent;

    return LessonEventModel.findOne({
      where: {and: [{teacherId: teacherId}, {startTime: {'gte': currentDate}},
          {state: {inq: [LessonEventState.PLANNED, LessonEventState.STARTED]}}]},
      order: ['startTime ASC'],
      include: include,
    });
  }

  completeLessonEvents() {
    const LessonEventModel = app.models.LessonEvent;
    const container = require('../conf/configure-container');
    /** @type ActivityLogService */
    const activityLogService = container.resolve('activityLogService');

    const currentDate = new Date();
    // search

    return LessonEventModel.find({
      where: {
        and: [{startTime: {'lte': currentDate}},
          {state: {inq: [LessonEventState.PLANNED, LessonEventState.STARTED]}}
        ],
      },
    }).then(results => {
      // for each result, check is'nt current time > than current's

      const calls = [];

      for (const instance of results) {
        const checkDate = new Date(instance.startTime);
        checkDate.setMinutes(checkDate.getMinutes() + instance.duration);

        // FIXME
        // checkDate.setDate(checkDate.getDate() - 3);
        // console.log('To check', checkDate);


        // logging and moving the state to completed
        if (currentDate > checkDate) {

          // console.log(currentDate, checkDate, 'checking');

          console.log('date is bigger');
          const previousState = instance.state;
          instance.state = LessonEventState.COMPLETED;
          calls.push(new Promise((resolve => {
            // change state than log
            return instance.save()
              .then(() => {
                return activityLogService.logLessonEventAutoStateChange(instance.studentId, instance.id, previousState, instance.state);
              })
              .then(() => {
                resolve();
              })
              .catch(err => {
                console.error('An error occurred during completeLessonEvents at', instance.id, err);
              });
          })));
        }
      }

      return Promise.all(calls).then(() => {
        if (calls.length) {
          console.log('all needle lessons is completed');
        } else {
          console.log('there was no lessons to complete');
        }
        return true;
      });


      return true;
    });
  }

}

module.exports = LessonService;