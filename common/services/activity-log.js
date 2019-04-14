'use strict';

var app = require('../../server/server');

var ActivityLogRealmEnum = require('../enums/activity-log.realm.enum');
var ActivityLogActionEnum = require('../enums/activity-log.action.enum');

const rootUserId = 0;

class ActivityLogService {

  logBalanceSpend(initiatorId, affectedId, lessonEventId, previousValue, currentValue) {

    // TODO: add the entityId property

    const ActivityLogModel = this.getActivityLogModel();

    const container = require('../conf/configure-container');

    /** @type DateService */
    const dateService = container.resolve('dateService');

    const formattedPreviousValue =  dateService.formatMinutesAsHoursString(previousValue);
    const formattedCurrentValue =  dateService.formatMinutesAsHoursString(currentValue);

    const data = this.createLogData(
      initiatorId,
      affectedId,
      lessonEventId,
      `Balance spent for the lesson event ` +
      `from ${formattedPreviousValue} to ${formattedCurrentValue}`,
      ActivityLogRealmEnum.BALANCE,
      ActivityLogActionEnum.BALANCE_SPEND
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logBalanceRefund(initiatorId, affectedId, lessonEventId, previousValue, currentValue) {

    const ActivityLogModel = this.getActivityLogModel();

    const container = require('../conf/configure-container');

    /** @type DateService */
    const dateService = container.resolve('dateService');

    const formattedPreviousValue =  dateService.formatMinutesAsHoursString(previousValue);
    const formattedCurrentValue =  dateService.formatMinutesAsHoursString(currentValue);

    const data = this.createLogData(
      initiatorId,
      affectedId,
      lessonEventId,
      `Balance refund for lesson event cancellation ` +
      `from ${formattedPreviousValue} to ${formattedCurrentValue}`,
      ActivityLogRealmEnum.BALANCE,
      ActivityLogActionEnum.BALANCE_REFUND
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logBalanceChange(initiatorId, affectedId, courseProgressId, previousValue, currentValue) {

    const container = require('../conf/configure-container');

    /** @type DateService */
    const dateService = container.resolve('dateService');

    const ActivityLogModel = this.getActivityLogModel();

    const formattedPreviousValue =  dateService.formatMinutesAsHoursString(previousValue);
    const formattedCurrentValue =  dateService.formatMinutesAsHoursString(currentValue);

    const data = this.createLogData(
      initiatorId,
      affectedId,
      courseProgressId,
      `Balance changed ` +
      `from ${formattedPreviousValue} to ${formattedCurrentValue}`,
      ActivityLogRealmEnum.BALANCE,
      ActivityLogActionEnum.BALANCE_CHANGE
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logLessonEventCreate(initiatorId, affectedId, lessonEventId) {
    const ActivityLogModel = this.getActivityLogModel();

    const data = this.createLogData(
      initiatorId,
      affectedId,
      lessonEventId,
      `The user has planned the lesson event`,
      ActivityLogRealmEnum.LESSON_EVENT,
      ActivityLogActionEnum.LESSON_EVENT_CREATE
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logLessonEventStateChange(initiatorId, affectedId, lessonEventId, previousValue, currentValue, reason) {
    const ActivityLogModel = this.getActivityLogModel();

    let messageSuffix = '';
    if (reason) {
      messageSuffix += ' due to "' + reason + '"';
    }

    const data = this.createLogData(
      initiatorId,
      affectedId,
      lessonEventId,
      `State of the lesson event has been changed from ` +
      `from {state: ${previousValue}} to {state: ${currentValue}}${messageSuffix}`,
      ActivityLogRealmEnum.LESSON_EVENT,
      ActivityLogActionEnum.LESSON_EVENT_STATUS_CHANGE
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logLessonEventAutoStateChange(affectedId, lessonEventId, previousValue, currentValue) {
    const ActivityLogModel = this.getActivityLogModel();

    const data = this.createLogData(
      rootUserId,
      affectedId,
      lessonEventId,
      `State of the lesson event has been automatically changed from ` +
      `from {state: ${previousValue}} to {state: ${currentValue}}`,
      ActivityLogRealmEnum.LESSON_EVENT,
      ActivityLogActionEnum.LESSON_EVENT_AUTO_STATUS_CHANGE
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logLessonEventTeacherAssignement(initiatorId, affectedId, lessonEventId, teacher) {
    const ActivityLogModel = this.getActivityLogModel();

    const data = this.createLogData(
      initiatorId,
      affectedId,
      lessonEventId,
      `Teacher for the lesson event has been assigned to teacher ` +
      `{customer: ${teacher.id}} (${teacher.email})`,
      ActivityLogRealmEnum.LESSON_EVENT,
      ActivityLogActionEnum.LESSON_EVENT_TEACHER_ASSIGNMENT
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logCustomerCreate(initiatorId, affectedId) {
    const ActivityLogModel = this.getActivityLogModel();

    const data = this.createLogData(
      initiatorId,
      affectedId,
      affectedId,
      `Customer created`,
      ActivityLogRealmEnum.CUSTOMER,
      ActivityLogActionEnum.CUSTOMER_CREATE
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  logCustomerUpdate(initiatorId, affectedId) {
    const ActivityLogModel = this.getActivityLogModel();

    const data = this.createLogData(
      initiatorId,
      affectedId,
      affectedId,
      `Customer data updated`,
      ActivityLogRealmEnum.CUSTOMER,
      ActivityLogActionEnum.CUSTOMER_UPDATE
    );

    return ActivityLogModel.create(data)
      .catch(err => {
        console.warn('Could not create log for this operation due to', err);
      });
  }

  getActivityLogModel() {
    return app.models.ActivityLog;
  }

  createLogData(initiatorId, affectedId, itemId, message, realm, action) {
    return {
      message: message,
      initiatorId: initiatorId,
      affectedId: affectedId,
      itemId: itemId,
      realm: realm,
      action: action,
    };
  }
}

module.exports = ActivityLogService;
