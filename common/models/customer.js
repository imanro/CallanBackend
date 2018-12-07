'use strict';

const HttpErrors = require('http-errors');

const container = require('../conf/configure-container');
/** @type CustomerService */
const customerService = container.resolve('customerService');
/** @type ActivityLogService */
const activityLogService = container.resolve('activityLogService');

module.exports = function(CustomerModel) {

  CustomerModel.afterRemote('create', async function(ctx, instance) {
    return customerService.assignCustomerRoles(instance.id, ctx.req.body.roles)
      .then(() => {
        const initiatorId = customerService.getCustomerIdByToken(ctx.req.accessToken);
        return activityLogService.logCustomerCreate(initiatorId, instance.id, instance.id)
      })
      .catch(err => {
        console.error(err, 'occurred');
      });
  });

  CustomerModel.afterRemote('replaceById', async function(ctx, instance) {
    return customerService.assignCustomerRoles(instance.id, ctx.req.body.roles)
      .then(() => {
        const initiatorId = customerService.getCustomerIdByToken(ctx.req.accessToken);
        return activityLogService.logCustomerUpdate(initiatorId, instance.id, instance.id)
      })
      .catch(err => {
        console.error(err, 'occurred');
      });
  });

};
