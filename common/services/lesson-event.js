'use strict';

var app = require('../../server/server');

class LessonEventService {

  static assignLessonEventEndTime(lessonEvents) {
    for (let i = 0; i < lessonEvents.length; i++) {
      const lessonEvent = lessonEvents[i];

      if (lessonEvent.startTime) {
        lessonEvent._endTime = new Date();
        lessonEvent._endTime.setTime(lessonEvent.startTime.getTime() + (lessonEvent.duration * 60000));
        console.log('created', lessonEvent.startTime, lessonEvent._endTime);
      }
    }
  }

  static isHourOfLessonEvent(hour, lessonEvent) {
    return lessonEvent.startTime.getHours() <= hour && lessonEvent._endTime.getHours() > hour;
  }

  static isHourOfLessonEvents(hour, lessonEvents) {

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

  static filterLessonEventsForDay(lessonEvents, checkDate) {
    return lessonEvents.filter(function(row) {
      return row.startTime &&
        row.startTime.getFullYear() === checkDate.getFullYear() &&
        row.startTime.getMonth() === checkDate.getMonth() &&
        row.startTime.getDate() === checkDate.getDate();
    });
  }

}

module.exports = LessonEventService;