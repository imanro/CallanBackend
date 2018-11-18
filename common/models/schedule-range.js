'use strict';

var ScheduleRangeRegularity = require('../enums/schedule-range.regularity.enum');
var ScheduleRangeType = require('../enums/schedule-range.type.enum');

module.exports = function(ScheduleRange) {

  ScheduleRange.availableHours = function(startDate, endDate, customerId, cb) {

    // find regular schedule ranges
    const filter = {where: {regularity: ScheduleRangeRegularity.REGULAR}};

    if (customerId) {
      filter['where']['customerId'] = customerId;
    }

    // find all regular ranges
    ScheduleRange.find(filter,
      function(err, rowsRegular) {

        if (err) {
          return cb(err);
        }

        // find ad-hoc ranges for these dates
        const filter = {where: {regularity: ScheduleRangeRegularity.AD_HOC, date: {between: [startDate, endDate]}}};

        console.log('looking between', filter['where']['date']['between']);

        ScheduleRange.find(filter, function(err, rowsAdHoc) {
          // find
          console.log('found', rowsAdHoc, 'too');

          // filter only with dates
          rowsAdHoc = rowsAdHoc.filter(function(row) {
            return row.date;
          });

          // setting dayOfWeek for adHoc
          for (const i in rowsAdHoc) {
            if (rowsAdHoc.hasOwnProperty(i)) {
              rowsAdHoc[i].dayOfWeek = rowsAdHoc[i].date.getDay();
            }
          }

          const rows = rowsRegular.concat(rowsAdHoc);
          for (let i in rows) {
            if (rows.hasOwnProperty(i)) {
              if (rows[i].endMinutes === 0) {
                console.log('Fixing end minute 0 -> last of the day');
                rows[i].endMinutes = 60 * 24 - 1;
              }
            }
          }

          // FIXME: in favour of startDate, endDate
          const currentDate = new Date();

          const inclusiveRanges = rows.filter(function(row) {
            return row.type === ScheduleRangeType.INCLUSIVE;
          });

          const exclusiveRanges = rows.filter(function(row) {
            return row.type === ScheduleRangeType.EXCLUSIVE;
          });

          const ranges = [];

          for (let dayNumber = 0; dayNumber < 7; dayNumber++) {
            console.log('checking day', dayNumber);
            const inclusiveForDay = inclusiveRanges.filter(function(row){
              return row.dayOfWeek === dayNumber;
            });

            const exclusiveForDay = exclusiveRanges.filter(function(row){
              return row.dayOfWeek === dayNumber;
            });

            console.log('inclusives', inclusiveForDay);

            for (let hour = 0; hour < 24; hour++) {

              for (const i in inclusiveForDay) {
                if (inclusiveForDay.hasOwnProperty(i)) {
                  const inclusiveRange = inclusiveForDay[i];
                  // console.log('checking inclusive range', range.id, range.startMinutes / 60, range.endMinutes / 60);
                  if(inclusiveRange.startMinutes / 60 <= hour && inclusiveRange.endMinutes / 60 > hour) {
                    console.log('Found inclusive date for day:', dayNumber, 'hour', hour);

                    let foundExclusive = false;
                    for (const j in exclusiveForDay) {
                      if (exclusiveRanges.hasOwnProperty(j)) {
                        const exclusiveRange = exclusiveRanges[j];

                        if(exclusiveRange.startMinutes / 60 <= hour && exclusiveRange.endMinutes / 60 > hour) {
                          console.log('Found exlclusive range for hour', hour);
                          foundExclusive = true;
                          break;
                        }
                      }
                    }

                    if (!foundExclusive) {
                      const date = new Date();

                      // FIXME: set day , month and year from startDate and endDate
                      date.setHours(hour);


                      // check: 1, now: 0
                      if (currentDate.getDay() === 0 && dayNumber !== 0) {
                        console.log('fixing for sunday (always substract)', (7 - dayNumber));
                        date.setDate(date.getDate() - (7 - dayNumber));

                      } else if (currentDate.getDay() > dayNumber) {
                        console.log('fixing for currently bigger', dayNumber, (currentDate.getDay() - dayNumber));

                        date.setDate(date.getDate() - (currentDate.getDay() - dayNumber));
                      } else if (currentDate.getDay() < dayNumber) {
                        console.log('fixing for currently smaller', dayNumber, (dayNumber - currentDate.getDay()));

                        date.setDate(date.getDate() + (dayNumber - currentDate.getDay()));
                      }

                      ranges.push(date);
                    }
                  }
                }
              }
            }
          }

          cb(null, ranges);
        });
      });

    // * sorting by inclusive and exclusive

    // * for each day (assuming now its just the week)

    // * searching in inclusive for this day (filter)

    // * for each hour in day

    // * for each inclusive for this day

    // * if includes, creating this date;
  };

  ScheduleRange.remoteMethod('availableHours', {
    accepts: [{arg: 'startDate', type: 'date'},
      {arg: 'endDate', type: 'date'},
      {arg: 'customerId', type: 'number'}],
    returns: {type: 'array', root: true},
    http: {verb: 'get'},
  });
};
