'use strict';
// This file contains the core models that needed to app work correctly

module.exports = function(app) {

  var Customer = app.models.Customer;

  /*
  Customer.find(function(err, instances) {
    for (var i in instances) {
      if (instances.hasOwnProperty(i)) {
        const customer = instances[i];

        var lessonBalanceData = {customerId: customer.id, amount: 0};
        LessonBalance.create(lessonBalanceData, function(err) {
          console.log('Lesson balance for user', customer.id, 'created!');
        });
      }
    }
  });
  */

  app.models.Customer.create([{
    email: 'manro@callan.com',
    firstName: 'Manro',
    lastName: 'Manro',
    password: 'Hjlmiy'
  }, {
    email: 'tertia@callan.com',
    firstName: 'Tertia',
    lastName: 'Fourie',
    password: '123456'
  }], function(err) {
    if (err) throw err;

  });

  /*
  app.models.Role.create([{
    name: 'admin'
  }, {
    name: 'teacher'
  }, {
    name: 'student'
  }, {
    name: 'support'
  }], function (err, roleInstance) {
    if (err) throw err;

    console.log('roles:', roleInstance);
  });
  */
}