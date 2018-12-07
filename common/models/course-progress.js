'use strict';

const container = require('../conf/configure-container');
/** @type ActivityLogService */
const activityLogService = container.resolve('activityLogService');
/** @type CustomerService */
const customerService = container.resolve('customerService');

module.exports = function(CourseProgressModel) {

  CourseProgressModel.beforeRemote('replaceById', async function(ctx) {
    return new Promise((resolve, reject) => {
      console.log('We have found the point (before)', ctx);

      CourseProgressModel.findById(ctx.args.id)
        .then(courseProgress => {
          // for logging purposes
          console.log('found previous instance', courseProgress);
          ctx.args.data.previousInstance = courseProgress;
          resolve();

        }, err => {
          resolve();
        });

      // setting previous balance value for logging purposes
      resolve();
    });
  });

  CourseProgressModel.afterRemote('replaceById', async function(ctx, instance) {
    return new Promise((resolve, reject) => {
      if (ctx.args.data.previousInstance) {
        const initiatorId = customerService.getCustomerIdByToken(ctx.req.accessToken);

        activityLogService.logBalanceChange(
          initiatorId,
          instance.customerId,
          instance.id,
          ctx.args.data.previousInstance.lessonEventsBalance,
          instance.lessonEventsBalance
        ).then(() => {
          resolve();
        }, err => {
          console.warn('An error occurred during the log creation', err);
          resolve();
        });

      } else {
        resolve();
      }
    });
  });
};
