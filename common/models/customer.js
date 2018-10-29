'use strict';

var utils = require('loopback-datasource-juggler/lib/utils');

module.exports = function (Customer) {

  Customer.on('dataSourceAttached', function () {

    var override = Customer.create;

    Customer.create = function (data, options, cb) {

      // will work only here
      var app = Customer.app;
      var RoleMapping = app.models.RoleMapping;

      if (typeof options === 'function') {
        cb = options;
      }

      cb = cb || utils.createPromiseCallback();

      var self = this;
      var id = null;

      override.call(self, data, options, function (err, modelInstance) {

        if (err) {
          return cb(err);
        }

        id = modelInstance.id;

        if (data.roles && data.roles.length) {
          console.log('roles given', data.roles);


          var roleData = [];

          for (var i in data.roles) {
            if (data.roles.hasOwnProperty(i)) {
              roleData.push({principalType: RoleMapping.USER, principalId: id, roleId: data.roles[i].id});
            }
          }

          console.log('We are going to add folowing roles:', roleData);

          RoleMapping.create(roleData, function (err) {
            if (err) {
              return cb(err);
            }

            Customer.findById(id, {include: ['roles']}, function (err, modelInstance) {
              return cb(err, modelInstance);
            });
          });

        } else {
          return cb(err, modelInstance);
        }
      });

      return cb.promise;
    };

  });
};
