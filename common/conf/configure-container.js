'use strict';

const awilix = require('awilix');

const DateService = require('../services/date');
const LessonService = require('../services/lesson');
const ScheduleService = require('../services/schedule');
const CustomerService = require('../services/customer');
const ActivityLogService = require('../services/activity-log');

const configureContainer = (function() {
  console.log('configuring our services');

  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  container.register({
    customerService: awilix.asFunction(() => {
      return new CustomerService();
    }).singleton(),

    dateService: awilix.asFunction(() => {
      return new DateService();
    }).singleton(),

    lessonService: awilix.asFunction(() => {
      return new LessonService();
    }).singleton(),

    scheduleService: awilix.asFunction(() => {
      return new ScheduleService();
    }).singleton(),

    activityLogService: awilix.asFunction(() => {
      return new ActivityLogService();
    }).singleton(),
  });

  return container;
})();

module.exports = configureContainer;
