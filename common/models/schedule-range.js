'use strict';

var app = require('../../server/server');
var LessonEventStateEnum = require('../enums/lesson-event.state.enum');
var ScheduleRangeRegularityEnum = require('../enums/schedule-range.regularity.enum');
var ScheduleRangeTypeEnum = require('../enums/schedule-range.type.enum');
var ScheduleService = require('../services/schedule');

const container = require('../conf/configure-container');

module.exports = function(ScheduleRangeModel) {

  ScheduleRangeModel.availableHours = function(startDate, endDate, customerId, isLookupLessonEvents) {

    console.log('TZ offset on API server is', new Date().getTimezoneOffset());

    /** @type ScheduleService */
    const scheduleService = container.resolve('scheduleService');

    /** @type DateService */
    const dateService = container.resolve('dateService');

    // _all_ regular ranges and ad_hoc between the dates
    const filterRegular = {where: {regularity: ScheduleRangeRegularityEnum.REGULAR}};
    const filterAdHoc = {
      where: {
        regularity: ScheduleRangeRegularityEnum.AD_HOC,
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
      ScheduleRangeModel.find(filterRegular),
      ScheduleRangeModel.find(filterAdHoc),
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

      // find
      // return [];
      return scheduleService.createHourlyDates(
        startDate, endDate, rowsRegular, rowsAdHoc, rowsLessonEvents
      );

    }, err => {
      console.error('An error occurred', err);
    });
  };

  ScheduleRangeModel.remoteMethod('availableHours', {
    accepts: [{arg: 'startDate', type: 'date'},
      {arg: 'endDate', type: 'date'},
      {arg: 'customerId', type: 'number'},
      {arg: 'isLookupLessonEvents', type: 'boolean'}
    ],
    returns: {type: 'array', root: true},
    http: {verb: 'get'},
  });
};
