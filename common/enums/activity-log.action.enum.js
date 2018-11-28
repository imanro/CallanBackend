'use strict';

class ActivityLogActionEnum {
  static get BALANCE_SPEND() {
    return 'BALANCE_SPEND';
  }

  static get BALANCE_REFUND() {
    return 'BALANCE_REFUND';
  }

  static get BALANCE_CHANGE() {
    return 'BALANCE_CHANGE';
  }

  static get LESSON_EVENT_STATUS_CHANGE() {
    return 'LESSON_EVENT_STATUS_CHANGE';
  }

  static get LESSON_EVENT_TEACHER_ASSIGNEMENT() {
    return 'LESSON_EVENT_TEACHER_ASSIGNEMENT';
  }
}

module.exports = ActivityLogActionEnum;
