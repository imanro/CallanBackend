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

  static get LESSON_EVENT_CREATE() {
    return 'LESSON_EVENT_CREATE';
  }

  static get LESSON_EVENT_STATUS_CHANGE() {
    return 'LESSON_EVENT_STATUS_CHANGE';
  }

  static get LESSON_EVENT_AUTO_STATUS_CHANGE() {
    return 'LESSON_EVENT_AUTO_STATUS_CHANGE';
  }

  static get LESSON_EVENT_TEACHER_ASSIGNMENT() {
    return 'LESSON_EVENT_TEACHER_ASSIGNMENT';
  }

  static get CUSTOMER_CREATE() {
    return 'CUSTOMER_CREATE';
  }

  static get CUSTOMER_UPDATE() {
    return 'CUSTOMER_UPDATE';
  }
}

module.exports = ActivityLogActionEnum;
