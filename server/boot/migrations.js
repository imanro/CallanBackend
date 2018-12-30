'use strict';

// Db migrations
const InitData = require('./components/create-init-data');

module.exports = function(app) {

  var ds = app.dataSources.mysqlDs;
  var models = ['Customer', 'Role', 'ACL', 'RoleMapping', 'AccessToken', 'Course', 'Lesson', 'CourseProgress', 'LessonEvent', 'ScheduleRange', 'ActivityLog', 'CourseCompetence', 'TimeZone'];

  ds.isActual(models, function(err, isActual){
    if (err) throw err;

    if (!isActual) {
      console.log('Models are not actual, performing autoupdate');
      ds.autoupdate(models)
        .then(() => {
          console.log('migrated');
          InitData.createInitData();
        })
        .catch(err => {
          console.error(err, 'occurred');
        })
      /* ds.autoupdate(models, function(err){


        if (err) throw err;
      });
      */
    }
  });
};
