'use strict';

const ScheduleRangeType = require('../enums/schedule-range.type.enum');

class ScheduleService {
  fixLastEndMinute(rows) {
    for (let i in rows) {
      if (rows.hasOwnProperty(i)) {
        if (rows[i].endMinutes === 0) {
          rows[i].endMinutes = 60 * 24 - 1;
        }
      }
    }
  }

  isHourInRange(hour, range) {
    return range.startMinutes / 60 <= hour && range.endMinutes / 60 > hour;
  }

  isHourInRanges(hour, ranges) {

    for (const i in ranges) {
      if (ranges.hasOwnProperty(i)) {
        const range = ranges[i];
        if (this.isHourInRange(hour, range)) {
          return true;
        }
      }
    }

    return false;
  }

  createCheckAdHocDate(startDate, dayNumber) {
    const date = new Date(startDate.getTime());
    date.setDate(date.getDate() + dayNumber);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    return date;
  }

  createHourlyDate(startDate, dayNumber, hour) {
    const date = new Date(startDate.getTime());
    date.setHours(hour);
    date.setDate(date.getDate() + dayNumber);
    return date;
  }

  filterRegularRangesForDay(ranges, checkDayOfWeek) {
    return ranges.filter(function(row) {
      return row.dayOfWeek === checkDayOfWeek;
    });
  }

  filterAdHocRangesForDay(ranges, checkDate) {
    return ranges.filter(function(row) {
      return row.date &&
        row.date.getFullYear() === checkDate.getFullYear() &&
        row.date.getMonth() === checkDate.getMonth() &&
        row.date.getDate() === checkDate.getDate();
    });
  }

  createHourlyDates(startDate, endDate, rowsRegular, rowsAdHoc, rowsLessonEvents) {

    /** @type DateService */

    // container should be required here, to avoid of circular dependency
    const container = require('../conf/configure-container');

    const dateService = container.resolve('dateService');

    /** @type LessonEventService */
    const lessonEventService = container.resolve('lessonEventService');

    // filter only with dates
    rowsAdHoc = rowsAdHoc.filter(function(row) {
      return row.date;
    });

    if (!rowsLessonEvents) {
      rowsLessonEvents = [];
    }

    lessonEventService.assignLessonEventEndTime(rowsLessonEvents);

    // setting dayOfWeek for adHoc
    this.fixLastEndMinute(rowsRegular);
    this.fixLastEndMinute(rowsAdHoc);

    // FIXME: in favour of startDate, endDate

    const inclusiveRegularRanges = rowsRegular.filter(function(row) {
      return row.type === ScheduleRangeType.INCLUSIVE;
    });

    const exclusiveRegularRanges = rowsRegular.filter(function(row) {
      return row.type === ScheduleRangeType.EXCLUSIVE;
    });

    const inclusiveAdHocRanges = rowsAdHoc.filter(function(row) {
      return row.type === ScheduleRangeType.INCLUSIVE;
    });

    const exclusiveAdHocRanges = rowsAdHoc.filter(function(row) {
      return row.type === ScheduleRangeType.EXCLUSIVE;
    });

    const ranges = [];

    // TODO: not to obay just by day numbers (cause it may repeat); probably, range of timestamps (stick to each range)
    const days = dateService.createDaysRange(startDate, endDate);

    for (let dayNumber = 0; dayNumber < days.length; dayNumber++) {

      const checkDayOfWeek = days[dayNumber];
      const checkDate = this.createCheckAdHocDate(startDate, dayNumber);

      console.log('checking day', checkDayOfWeek);
      const inclusiveRegularForDay = this.filterRegularRangesForDay(inclusiveRegularRanges, checkDayOfWeek);
      const exclusiveRegularForDay = this.filterRegularRangesForDay(exclusiveRegularRanges, checkDayOfWeek);

      const inclusiveAdHocForDay = this.filterAdHocRangesForDay(inclusiveAdHocRanges, checkDate);
      const exclusiveAdHocForDay = this.filterAdHocRangesForDay(exclusiveAdHocRanges, checkDate);
      const lessonEventsForDay = lessonEventService.filterLessonEventsForDay(rowsLessonEvents, checkDate);

      for (let hour = 0; hour < 24; hour++) {
        const date = this.createHourlyDate(startDate, dayNumber, hour);

        if (lessonEventService.isHourOfLessonEvents(hour, lessonEventsForDay)) {
          console.log('Found lesson event for an hour', hour);
          // not adding

        } else {

          if (this.isHourInRanges(hour, inclusiveRegularForDay)) {
            if (this.isHourInRanges(hour, exclusiveRegularForDay)) {
              if (this.isHourInRanges(hour, inclusiveAdHocForDay)) {
                ranges.push(date);
              } else {
                // not adding
                ;
              }
            } else {

              if (this.isHourInRanges(hour, exclusiveAdHocForDay)) {
                // not adding

              } else {
                ranges.push(date);
              }
            }

          } else {
            if (this.isHourInRanges(hour, inclusiveAdHocForDay)) {
              ranges.push(date);
            } else {
              // not adding
              ;
            }
          }
        }
      }
    }

    return ranges;
  }

}

module.exports = ScheduleService;
