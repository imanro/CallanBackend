'use strict';

var app = require('../../server/server');

class LessonEventService {

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

  assignLessonEventTeacher(lessonEvent) {
    // find the previous instance of the model with such id

    return new Promise((resolve, reject) => {
      if (lessonEvent.teacherId) {
        // lesson already has the teacher
        resolve();
      }
      const container = require('../conf/configure-container');

      /** @type UserService */
      const userService = container.resolve('userService');

      userService.findFreeTeacher()
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

}

module.exports = LessonEventService;