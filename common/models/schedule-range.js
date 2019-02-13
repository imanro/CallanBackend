'use strict';

const HttpErrors = require('http-errors');

var app = require('../../server/server');
var LessonEventStateEnum = require('../enums/lesson-event.state.enum');
var ScheduleRangeRegularityEnum = require('../enums/schedule-range.regularity.enum');
var ScheduleRangeTypeEnum = require('../enums/schedule-range.type.enum');

const container = require('../conf/configure-container');

/** @type GoogleApiService */
const googleApiService = container.resolve('googleApiService');

module.exports = function(ScheduleRangeModel) {

  ScheduleRangeModel.availableDates = function(startDate, endDate, courseProgressId, customerId, isLookupLessonEvents) {

    console.log('TZ offset on API server is', new Date().getTimezoneOffset());

    /** @type ScheduleService */
    const scheduleService = container.resolve('scheduleService');

    /** @type LessonService */
    const lessonService = container.resolve('lessonService');

    let customerFind;

    if (customerId) {

      console.log('Customer given', customerId);

      const customerModel = app.models.Customer;
      customerFind = customerModel.find({where: {id: customerId}});
    } else {
      customerFind = lessonService.findTeachersByCourseProgress(courseProgressId);
    }

    return customerFind
      .then(customers => {
        const customerIds = [];

        for (const customer of customers) {
          customerIds.push(customer.id);
        }

        return scheduleService.findScheduleRangesByTeachers(customerIds, startDate, endDate, isLookupLessonEvents);
      }).then(results => {

        if (customerId) {
          console.log('Asking for the google calendar results');

          // assuming that we need to exclude one teacher's personal events
          return Promise.all([
            results,
            googleApiService.getCalendarEvents(customerId, startDate, endDate),
          ]);
        } else {
          return Promise.all([
            results,
            null,
          ]);
        }

      }).then(results => {

        if (results[1]) {
          console.log('We have received googleCalendarResultsToo!!');
        }

        const [rowsRegular, rowsAdHoc, rowsLessonEvents] = results[0];

        // find
        // return [];
        return Promise.all([
          scheduleService.createHourlyDates(
          startDate, endDate, rowsRegular, rowsAdHoc, rowsLessonEvents
        ), 3]);
      }).then(results => {
        console.log(results[1]);
        return results[0];

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

  };

  ScheduleRangeModel.remoteMethod('availableDates', {
    accepts: [{arg: 'startDate', type: 'date'},
      {arg: 'endDate', type: 'date'},
      {arg: 'courseProgressId', type: 'number'},
      {arg: 'customerId', type: 'number'},
      {arg: 'isLookupLessonEvents', type: 'boolean'}
    ],
    returns: {type: 'array', root: true},
    http: {verb: 'get'},
  });
};
