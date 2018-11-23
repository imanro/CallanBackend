'use strict';

const awilix = require('awilix');

const DateService = require('../services/date');
const LessonEventService = require('../services/lesson-event');
const ScheduleService = require('../services/schedule');
const UserService = require('../services/user');
const ActivityLogService = require('../services/activity-log');

const configureContainer = (function() {
  console.log('configuring our services');

  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  container.register({
    userService: awilix.asFunction(() => {
      return new UserService();
    }).singleton(),

    dateService: awilix.asFunction(() => {
      return new DateService();
    }).singleton(),

    lessonEventService: awilix.asFunction(() => {
      return new LessonEventService();
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
