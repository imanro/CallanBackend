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
  static get CANCELED() {
    return 4;
  }
}

module.exports = LessonEventStateEnum;
