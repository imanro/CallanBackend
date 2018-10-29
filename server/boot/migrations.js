'use strict';

// Db migrations


module.exports = function(app) {

  var ds = app.dataSources.mysqlDs;
  var models = ['CourseProgress'];

  ds.isActual(models, function(err, isActual){
    if (err) throw err;

    if (!isActual) {
      ds.autoupdate(models, function(err){
        if (err) throw err;
      });
    }
  });
};
