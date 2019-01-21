'use strict';

var app = require('../../server/server');

const ScheduleRangeTypeEnum = require('../enums/schedule-range.type.enum');
const ScheduleRangeRegularityEnum = require('../enums/schedule-range.regularity.enum');
const LessonEventStateEnum = require('../enums/lesson-event.state.enum');

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

  isDateInRange(date, range) {
    return date.getTime() >= range[0].getTime() && date.getTime() < range[1].getTime();
  }

  isDateInRanges(date, ranges) {

    for (const i in ranges) {
      if (ranges.hasOwnProperty(i)) {
        const range = ranges[i];
        if (this.isDateInRange(date, range)) {
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

  createHourlyDate(day, hour) {
    const date = new Date(day.getTime());
    date.setHours(hour);
    return date;
  }

  createMinuteDate(day, hour, minutes) {
    const date = new Date(day.getTime());
    date.setHours(hour);
    date.setMinutes(minutes);
    return date;
  }

  convertScheduleRangeToDates(scheduleRange) {

    // for regular time range - dayOfWeek + deal with it
    let currentDate;

    if (scheduleRange.regularity === ScheduleRangeRegularityEnum.REGULAR) {
      currentDate = new Date();
      currentDate.setUTCHours(0, 0, 0, 0);
      const offset = currentDate.getDay() - scheduleRange.dayOfWeek;

      currentDate.setDate(currentDate.getDate() - offset);

    } else {
      currentDate = new Date(scheduleRange.date.getTime());
      // and only then set the time to zero
      currentDate.setUTCHours(0, 0, 0, 0);

      console.log('Ad hoc date processing', currentDate);
    }

    // for adHoc: exactDayOfWeek -> 0:00:00 UTC

    // current date is today 0:0 UTC?

    var startDate = new Date(currentDate.getTime());

    startDate.setUTCHours(scheduleRange.startMinutes / 60, scheduleRange.startMinutes % 60);

    // + TZ offset
    startDate.setUTCHours(startDate.getUTCHours() + (scheduleRange.timezoneOffset / 60));

    const endDate = new Date(currentDate.getTime());

    endDate.setUTCHours(scheduleRange.endMinutes / 60, scheduleRange.endMinutes % 60);

    // + TZ offset
    endDate.setUTCHours(endDate.getUTCHours() + (scheduleRange.timezoneOffset / 60));

    return [startDate, endDate];
  }

  convertScheduleRangesToDates(scheduleRanges) {

    const ranges = [];
    for (const range of scheduleRanges) {
      const dateRange = this.convertScheduleRangeToDates(range);
      ranges.push(dateRange);
    }

    return ranges;
  }

  adoptRegularRangesDates(rangesDates, days) {

    // (for each date in given range, check getDay()

    // search for regular range with the same day

    // if found

    // create a new range, set day to this date, 0:0:0

    // get the distance between two dates of ranges in getTime() as value X

    // search for the same getDay in given regular ranges (search by 1st element)

    // set hours from there, and for the 2nd - copy 1st + value X

    const adopted = [];

    for (const day of days) {

      for (const rangeDate of rangesDates) {
        const [startRangeDate, endRangeDate] = rangeDate;

        if (day.getDay() === startRangeDate.getDay()) {
          const timeDiff = endRangeDate.getTime() - startRangeDate.getTime();

          const startDate = new Date(day.getTime());
          startDate.setHours(startRangeDate.getHours(), startRangeDate.getMinutes(), 0, 0);

          const endDate = new Date(startDate.getTime() + timeDiff);

          adopted.push([startDate, endDate]);
        }
      }
    }

    return adopted;
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

    // container should be required here, to avoid of circular dependency
    const container = require('../conf/configure-container');

    /** @type DateService */
    const dateService = container.resolve('dateService');

    /** @type LessonService */
    const lessonService = container.resolve('lessonService');

    /** @type ConfigService */
    const configService = container.resolve('configService');

    // filter only with dates
    rowsAdHoc = rowsAdHoc.filter(function(row) {
      return row.date;
    });

    // setting dayOfWeek for adHoc
    this.fixLastEndMinute(rowsRegular);
    this.fixLastEndMinute(rowsAdHoc);

    const rowsRegularInclusive = rowsRegular.filter((row) => {
      return row.type === ScheduleRangeTypeEnum.INCLUSIVE;
    });

    const rowsRegularExclusive = rowsRegular.filter((row) => {
      return row.type === ScheduleRangeTypeEnum.EXCLUSIVE;
    });

    const rowsAdHocInclusive = rowsAdHoc.filter((row) => {
      return row.type === ScheduleRangeTypeEnum.INCLUSIVE;
    });

    const rowsAdHocExclusive = rowsAdHoc.filter((row) => {
      return row.type === ScheduleRangeTypeEnum.EXCLUSIVE;
    });

    if (!rowsLessonEvents) {
      rowsLessonEvents = [];
    }

    lessonService.assignLessonEventEndTime(rowsLessonEvents);

    // + processing of inclusive
    const regularInclusiveRangesDates = this.convertScheduleRangesToDates(rowsRegularInclusive);
    const regularExclusiveRangesDates = this.convertScheduleRangesToDates(rowsRegularExclusive);

    const adHocInclusiveRangesDates = this.convertScheduleRangesToDates(rowsAdHocInclusive);
    const adHocExclusiveRangesDates = this.convertScheduleRangesToDates(rowsAdHocExclusive);

    // create range from startDate and endDate
    const days = dateService.createDaysRange(startDate, endDate, true);

    const adoptedRegularInclusiveRangesDates = this.adoptRegularRangesDates(regularInclusiveRangesDates, days);
    const adoptedRegularExclusiveRangesDates = this.adoptRegularRangesDates(regularExclusiveRangesDates, days);

    const ranges = [];

    const minuteStep = configService.getValue('scheduleService.scheduleMinuteStep') || 60;

    for (const day of days) {

      console.log('checking day', day);
      const lessonEventsForDay = lessonService.filterLessonEventsForDay(rowsLessonEvents, day);

      for (let hour = 0; hour < 24; hour++) {

        for (let minute = 0; minute < 60; minute += minuteStep) {

          console.log('checking', minute);

          const checkDate = this.createMinuteDate(day, hour, minute);
          console.log('Check date is:', checkDate);

          if (lessonService.isDateOfLessonEvents(checkDate, lessonEventsForDay)) {
            console.log('Found lesson event for an hour', hour);
            // not adding

          } else {

            console.log('nf');
            if (this.isDateInRanges(checkDate, adoptedRegularInclusiveRangesDates)) {
              console.log('is');
              if (this.isDateInRanges(checkDate, adoptedRegularExclusiveRangesDates)) {
                if (this.isDateInRanges(checkDate, adHocInclusiveRangesDates)) {
                  ranges.push(checkDate);

                } else {
                  // not adding
                  ;
                }
              } else {

                if (this.isDateInRanges(checkDate, adHocExclusiveRangesDates)) {
                  // not adding

                } else {
                  ranges.push(checkDate);
                }
              }

            } else {
              if (this.isDateInRanges(checkDate, adHocInclusiveRangesDates)) {
                ranges.push(checkDate);
              } else {
                // not adding
                ;
              }
            }

          }
        }
      }
    }

    return ranges;
  }

  findScheduleRangesByTeachers(customerIds, startDate, endDate, isLookupLessonEvents) {

    console.log('Customers:', customerIds);

    const scheduleRangeModel = app.models.ScheduleRange;

    // _all_ regular ranges and ad_hoc between the dates
    const filterRegular = {
      where: {
        customerId: {inq: customerIds},
        regularity: ScheduleRangeRegularityEnum.REGULAR,
      },
    };

    const filterAdHoc = {
      where: {
        customerId: {inq: [customerIds]},
        regularity: ScheduleRangeRegularityEnum.AD_HOC,
        date: {between: [startDate, endDate]},
      },
    };

    const findStack = [
      scheduleRangeModel.find(filterRegular),
      scheduleRangeModel.find(filterAdHoc),
    ];

    if (isLookupLessonEvents) {
      const LessonEvent = app.models.LessonEvent;
      const filterLessonEvents = {
        where: {
          startTime: {between: [startDate, endDate]},
          state: {neq: LessonEventStateEnum.CANCELED},
          teacherId: {inq: customerIds}
        },
      };

      findStack.push(LessonEvent.find(filterLessonEvents));
    }

    return Promise.all(
      findStack
    );
  }

}

module.exports = ScheduleService;
