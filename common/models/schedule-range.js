'use strict';

var app = require('../../server/server');
var LessonEventStateEnum = require('../enums/lesson-event.state.enum');
var ScheduleRangeRegularity = require('../enums/schedule-range.regularity.enum');
var ScheduleService = require('../services/schedule');

module.exports = function(ScheduleRange) {

  ScheduleRange.availableHours = function(startDate, endDate, customerId, isLookupLessonEvents) {

    // find regular schedule ranges
    const filterRegular = {where: {regularity: ScheduleRangeRegularity.REGULAR}};
    const filterAdHoc = {
      where: {
        regularity: ScheduleRangeRegularity.AD_HOC,
        date: {between: [startDate, endDate]},
      },
    };

    console.log('looking between', filterAdHoc['where']['date']['between']);

    if (customerId) {
      console.log('customer received');
      filterRegular['where']['customerId'] = customerId;
      filterAdHoc['where']['customerId'] = customerId;
    }

    const findStack = [
      ScheduleRange.find(filterRegular),
      ScheduleRange.find(filterAdHoc)
    ];

    if (isLookupLessonEvents) {
      const LessonEvent = app.models.LessonEvent;
      const filterLessonEvents = {
        where: {
          startTime: {between: [startDate, endDate]},
          state: {neq: LessonEventStateEnum.CANCELED},
        }
      };

      findStack.push(LessonEvent.find(filterLessonEvents));
    }

    return Promise.all(
      findStack
    ).then(results => {
      const [rowsRegular, rowsAdHoc, rowsLessonEvents] = results;

      console.log('found', rowsAdHoc, 'too');
      console.log('found lesson events', rowsLessonEvents);

      // find
      return ScheduleService.createHourlyDates(
        startDate, endDate, rowsRegular, rowsAdHoc, rowsLessonEvents
      );
    }, err => {
      console.error('An error occurred', err);
    });
  };

  ScheduleRange.remoteMethod('availableHours', {
    accepts: [{arg: 'startDate', type: 'date'},
      {arg: 'endDate', type: 'date'},
      {arg: 'customerId', type: 'number'},
      {arg: 'isLookupLessonEvents', type: 'boolean'}
    ],
    returns: {type: 'array', root: true},
    http: {verb: 'get'},
  });
};
