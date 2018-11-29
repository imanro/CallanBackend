'use strict';

var app = require('../../server/server');

var ActivityLogRealmEnum = require('../enums/activity-log.realm.enum');
var ActivityLogActionEnum = require('../enums/activity-log.action.enum');

const rootUserId = 0;

class ActivityLogService {

  logBalanceSpend(initiatorId, affectedId, lessonEventId, previousValue, currentValue) {
    return new Promise((resolve, reject) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Balance spent for the lesson event ` +
        `from ${previousValue} to ${currentValue}`,
        ActivityLogRealmEnum.BALANCE,
        ActivityLogActionEnum.BALANCE_SPEND
      );

      ActivityLogModel.create(data)
        .then(() => {
          resolve(true);
        }, err => {
          console.warn('Could not create log for this operation due to', err);
          reject();
        });
    });
  }

  logBalanceRefund(initiatorId, affectedId, lessonEventId, previousValue, currentValue) {
    return new Promise((resolve, reject) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Balance refund for lesson event cancellation ` +
        `from ${previousValue} to ${currentValue}`,
        ActivityLogRealmEnum.BALANCE,
        ActivityLogActionEnum.BALANCE_REFUND
      );

      ActivityLogModel.create(data)
        .then(() => {
          console.log('resolved');
          resolve(true);
        }, err => {
          console.warn('Could not create log for this operation due to', err);
          reject();
        });
    });
  }

  logBalanceChange(initiatorId, affectedId, courseProgressId, previousValue, currentValue) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Balance changed ` +
        `from ${previousValue} to ${currentValue}`,
        ActivityLogRealmEnum.BALANCE,
        ActivityLogActionEnum.BALANCE_CHANGE
      );

      ActivityLogModel.create(data)
        .then(() => {
          resolve();
        }, err => {
          console.warn('Could not create log for this operation due to', err);
        });
    });
  }

  logLessonEventStateChange(initiatorId, affectedId, lessonEventId, previousValue, currentValue, reason) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      let messageSuffix = '';
      if (reason) {
        messageSuffix += ' due to "' + reason + '"';
      }

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `State of the lesson event has been changed from ` +
        `from {state: ${previousValue}} to {state: ${currentValue}}${messageSuffix}`,
        ActivityLogRealmEnum.LESSON_EVENT,
        ActivityLogActionEnum.LESSON_EVENT_STATUS_CHANGE
      );

      ActivityLogModel.create(data)
        .then(() => {
          resolve();
        }, err => {
          console.warn('Could not create log for this operation due to', err);
        });
    });
  }

  logLessonEventAutoStateChange(affectedId, lessonEventId, previousValue, currentValue) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        rootUserId,
        affectedId,
        `State of the lesson event has been automatically changed from ` +
        `from {state: ${previousValue}} to {state: ${currentValue}}`,
        ActivityLogRealmEnum.LESSON_EVENT,
        ActivityLogActionEnum.LESSON_EVENT_AUTO_STATUS_CHANGE
      );

      ActivityLogModel.create(data)
        .then(() => {
          resolve();
        }, err => {
          console.warn('Could not create log for this operation due to', err);
        });
    });
  }

  logLessonEventTeacherAssignement(initiatorId, affectedId, lessonEventId, teacher) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Teacher for the lesson event has been assigned to teacher ` +
        `{customer: ${teacher.id}} (${teacher.email})`,
        ActivityLogRealmEnum.LESSON_EVENT,
        ActivityLogActionEnum.LESSON_EVENT_TEACHER_ASSIGNEMENT
      );

      ActivityLogModel.create(data)
        .then(() => {
          resolve();
        }, err => {
          console.warn('Could not create log for this operation due to', err);
        });
    });
  }

  getActivityLogModel() {
    return app.models.ActivityLog;
  }

  createLogData(initiatorId, affectedId, message, realm, action) {
    return {
      message: message,
      initiatorId: initiatorId,
      affectedId: affectedId,
      realm: realm,
      action: action,
    };
  }
}

module.exports = ActivityLogService;
