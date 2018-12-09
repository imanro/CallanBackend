'use strict';

// Db migrations


module.exports = function(app) {

  var ds = app.dataSources.mysqlDs;
  var models = ['Customer', 'Role', 'ACL', 'RoleMapping', 'AccessToken', 'Course', 'Lesson', 'CourseProgress', 'LessonEvent', 'ScheduleRange', 'ActivityLog', 'CourseCompetence'];

  ds.isActual(models, function(err, isActual){
    if (err) throw err;

    if (!isActual) {
      console.log('Models are not actual, performing autoupdate');
      ds.autoupdate(models, function(err){
        if (err) throw err;
      });
    }
  });
};
