'use strict';

var app = require('../../server/server');
const RoleNameEnum = require('../enums/role.name.enum');

class UserService {

  findFreeTeacher() {

    const RoleMappingModel = app.models.RoleMapping;
    const CustomerModel = app.models.Customer;

    return new Promise((resolve, reject) => {
      this.getRoleByName(RoleNameEnum.TEACHER)
        .then(role => {
          RoleMappingModel.findOne({
            where: {roleId: role.id, principalType: 'USER'},
            order: 'id ASC'
          }).then(mappingInstance => {

            CustomerModel.findOne({
              where:
                {id: mappingInstance.principalId}
            })
              .then(customer => {
                  resolve(customer);
                },
                err => {
                  reject(err);
                });
          }, err => {
            reject(err);
          });

        }, err => {
          reject(err);
        });
    });
  }

  getUserIdByToken(token) {
    if (token) {
      return token.userId;
    } else {
      return null;
    }
  }

  getRoleByName(roleName) {
    const RoleModel = app.models.Role;
    return RoleModel.findOne({where: {name: roleName}});
  }
}

module.exports = UserService;