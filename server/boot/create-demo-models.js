'use strict';

module.exports = function (app) {

//  This file contains demo models for mock purpose

/*
    app.models.LessonEvent.create([
      {
        'time': '2018-06-20T22:46:52.234Z',
        'duration': 0,
        'state': 0

      }], function(err, lessonEvents) {
      if (err) throw err;

      console.log('Models created: \n', lessonEvents);
    });

    app.dataSources.mysqlDs.automigrate('AccessToken', function(err) {
      if (err) throw err;
      console.log('Success');
    });

    app.dataSources.mysqlDs.automigrate('Customer', function(err) {
      if (err) throw err;

      console.log('Creating manro and tertia users');

      app.models.Customer.create([{
        email: 'manro@callan.com',
        firstName: 'Manro',
        lastName: 'Manro',
        password: 'Hjlmiy'
      }, {
        email: 'tertia@callan.com',
        firstName: 'Tertia',
        lastName: 'Fourtie',
        password: '123456'
      }], function(err, customerInstance) {
        if (err) throw err;
        console.log(customerInstance);
      });

*/


/*
  var RoleMapping = app.models.RoleMapping;

  // making "manro" as admin
  app.models.Customer.findOne({where: {email: 'tertia@callan.com'}},
    function(err, customer) {

      if (err) throw err;

      if (customer) {
        app.models.Role.findOne({where: {name: 'teacher'}}, function (err, role) {

          if (err) throw err;

          console.log('found:', customer, role);

          if(role) {

            role.principals.create({
              principalType: RoleMapping.USER,
              principalId: customer.id
            }, function (err, principal) {
              if (err) throw err;

              console.log('Created', principal);
            });
          }
        });
      }
    });
*/


};
