'use strict';

class RoleNameEnum {
  static get ADMIN() {
    return 'admin';
  }
  static get STUDENT() {
    return 'student';
  }
  static get TEACHER() {
    return 'teacher';
  }
  static get SUPPORT() {
    return 'support';
  }
}

module.exports = RoleNameEnum;
