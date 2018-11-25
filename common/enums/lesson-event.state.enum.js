'use strict';

class LessonEventStateEnum {
  static get PLANNED() {
    return 1;
  }
  static get STARTED() {
    return 2;
  }
  static get COMPLETED() {
    return 3;
  }
  static get CONFIRMED() {
    return 4;
  }
  static get CANCELED() {
    return 5;
  }
}

module.exports = LessonEventStateEnum;
