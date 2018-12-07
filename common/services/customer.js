'use strict';

var app = require('../../server/server');
const RoleNameEnum = require('../enums/role.name.enum');

class CustomerService {

  findFreeTeacher() {

    const RoleMappingModel = app.models.RoleMapping;
    const CustomerModel = app.models.Customer;

    return this.getRoleByName(RoleNameEnum.TEACHER)
      .then(role => {
        return RoleMappingModel.findOne({
          where: {roleId: role.id, principalType: 'USER'},
          order: 'id ASC',
        });
      }).then(mappingInstance => {
        return CustomerModel.findOne({
          where: {id: mappingInstance.principalId}
        });
      });
  }

  assignCustomerRoles(userId, roles) {
    var RoleMapping = app.models.RoleMapping;

    // delete first previous
    return RoleMapping.destroyAll({principalType: RoleMapping.USER, principalId: userId})
      .then(() => {
        const roleData = [];
        for (const role of roles) {
          roleData.push({principalType: RoleMapping.USER, principalId: userId, roleId: role.id});
        }
        return RoleMapping.create(roleData);
      });
  }

  getCustomerIdByToken(token) {
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

module.exports = CustomerService;