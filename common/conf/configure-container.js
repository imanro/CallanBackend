'use strict';

const awilix = require('awilix');

const ConfigService = require('../services/config');
const DateService = require('../services/date');
const LessonService = require('../services/lesson');
const ScheduleService = require('../services/schedule');
const CustomerService = require('../services/customer');
const ActivityLogService = require('../services/activity-log');
const MailerService = require('../services/mailer');
const MailNotificationService = require('../services/mail-notification');
const GoogleApiService = require('../services/google-api');

const configureContainer = (function() {
  console.log('configuring our services');

  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  container.register({

    configService: awilix.asFunction(() => {
      return new ConfigService();
    }).singleton(),

    mailerService: awilix.asFunction(() => {
      return new MailerService();
    }).singleton(),

    mailNotificationService: awilix.asFunction(() => {
      return new MailNotificationService();
    }).singleton(),

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

    googleApiService: awilix.asFunction(() => {
      return new GoogleApiService();
    }).singleton(),

  });

  return container;
})();

module.exports = configureContainer;
