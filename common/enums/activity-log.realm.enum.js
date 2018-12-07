'use strict';

class ActivityLogRealmEnum {
  static get OTHER() {
    return 1;
  }

  static get BALANCE() {
    return 2;
  }

  static get LESSON_EVENT() {
    return 3;
  }

  static get CUSTOMER() {
    return 4;
  }
}

module.exports = ActivityLogRealmEnum;
