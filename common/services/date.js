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

  convertToTimezone(date, id) {
    // get timezone name

    // convert
  }

  formatMinutesAsHoursString(min) {
    // 119
    const hoursPart = Math.floor(min / 60);
    const minutesPart = min % 60;

    if (minutesPart) {
      return `${hoursPart} h. ${minutesPart} min.`;
    } else {
      return `${hoursPart} h.`;
    }
  }

}

module.exports = DateService;
