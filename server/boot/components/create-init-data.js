'use strict';

var app = require('../../../server/server');

class InitData {
  static createInitData() {
    const timeZone = app.models.TimeZone;

    timeZone.count()
      .then(value => {
        if (value === 0) {
          const data = require('../../../common/data/timezone');
          return timeZone.create(data);
        }
      })
      .then(result => {
        console.log('All data created');
      })
      .catch(err => {
        console.log(err, 'occurred');
      });
  };
}

module.exports = InitData;
