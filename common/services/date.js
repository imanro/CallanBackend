'use strict';

var app = require('../../server/server');

class DateService {

  static getDaysBetween(startDate, endDate) {
    return Math.round((endDate - startDate) / (24 * 60 * 60 * 1000));
  }

  static createDaysRange(startDate, endDate) {
    const daysBetween = this.getDaysBetween(startDate, endDate);

    const range = [];
    let currentDay = startDate.getDay();

    for (let i = 0; i < daysBetween; i++) {
      range.push(currentDay);

      if (currentDay === 6) {
        currentDay = 0;
      } else {
        currentDay++;
      }
    }

    return range;
  }
}

module.exports = DateService;
