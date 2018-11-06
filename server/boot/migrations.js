'use strict';

// Db migrations


module.exports = function(app) {

  var ds = app.dataSources.mysqlDs;
  var models = ['ScheduleRange'];

  ds.isActual(models, function(err, isActual){
    if (err) throw err;

    if (!isActual) {
      console.log('Models is not actual, performing autoupdate');
      ds.autoupdate(models, function(err){
        if (err) throw err;
      });
    }
  });
};
