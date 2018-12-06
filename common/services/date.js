'use strict';

var app = require('../../server/server');

class DateService {

  getDaysBetween(startDate, endDate) {
    return Math.round((endDate - startDate) / (24 * 60 * 60 * 1000));
  }

  createDaysRange(startDate, endDate, expandForTimezones = false) {
    const daysBetween = this.getDaysBetween(startDate, endDate);

    const range = [];
    let currentDay = startDate.getDay();

    // to deal with timezones
    let startBound, endBound;
    if (expandForTimezones) {
      startBound = -1;
      endBound = daysBetween + 1;
    } else {
      startBound = 0;
      endBound = daysBetween;
    }
    for (let i = startBound; i < endBound; i++) {
      const date = new Date(startDate.getTime());
      date.setDate(date.getDate() + i);
      range.push(date);
    }

    return range;
  }

}

module.exports = DateService;
