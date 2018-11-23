'use strict';

var app = require('../../server/server');

var ActivityLogRealmEnum = require('../enums/activity-log.realm.enum');
var ActivityLogActionEnum = require('../enums/activity-log.action.enum');

class ActivityLogService {

  logBalanceSpend(initiatorId, affectedId, lessonEventId, previousValue, currentValue) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Balance spent for ${lessonEventId} lessonEvent ` +
        `from ${previousValue} to ${currentValue}`,
        ActivityLogRealmEnum.BALANCE,
        ActivityLogActionEnum.BALANCE_SPEND
      );

      ActivityLogModel.create(data)
        .then(() => {
          resolve();
        }, err => {
          console.warn('Could not create log for this operation due to', err);
        });
    });
  }

  logBalanceChange(initiatorId, affectedId, courseProgressId, previousValue, currentValue) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Balance changed for ${courseProgressId} courseProgress ` +
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

  logLessonEventStateChange(initiatorId, affectedId, lessonEventId, previousValue, currentValue) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Status of the lessonEvent ${lessonEventId} has been changed from ` +
        `from ${previousValue} to ${currentValue}`,
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

  logLessonEventTeacherAssignement(initiatorId, affectedId, lessonEventId, teacher) {
    return new Promise((resolve) => {
      const ActivityLogModel = this.getActivityLogModel();

      const data = this.createLogData(
        initiatorId,
        affectedId,
        `Teacher for the lessonEvent ${lessonEventId} has been assigned to teacher ` +
        `${teacher.id} (${teacher.email})`,
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
      action: action
    };
  }
}

module.exports = ActivityLogService;
