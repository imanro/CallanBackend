'use strict';

const HttpErrors = require('http-errors');
const app = require('../../server/server');

const container = require('../conf/configure-container');
/** @type CustomerService */
const customerService = container.resolve('customerService');
/** @type ActivityLogService */
const activityLogService = container.resolve('activityLogService');
/** @type GoogleApiService */
const googleApiService = container.resolve('googleApiService');
/** @type ConfigService */
const configService = container.resolve('configService');

const url = require('url');

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

  CustomerModel.beforeRemote('prototype.patchAttributes', async function(ctx) {

    const instance = ctx.instance;

    if (ctx.req.body.timezoneName && !instance.timezoneId || ctx.req.body.force) {
      const timeZone = app.models.TimeZone;

      console.log('Try to update');
      return timeZone.findOne({'where': {'name': ctx.req.body.timezoneName}})
        .then(zone => {
          if( zone ) {
            console.log('TimeZone found', zone);
            ctx.req.body.timezoneId = zone.id;
            console.log(ctx.req.body);
          }

          return true;
        })

    } else {
      // if(instance.timezoneId) {
      // ctx.req.body.timezoneId = instance.timezoneId;
      // }
      return true;
    }
    // find existing, check if it has timezone

    // if no, _or_ if there is option "force" in body, find the id of given timezone and replace body's argument

    //

    // after customer's login, try to update his timezone

    // here, in backend, update only if there is parameter "force" _or_ this value is'nt set before

    // check is there's timezone in request, convert to id from table
  });

  // to quick detect name of remote-method, see strong-remoting/lib/remote-objects.js:405 (RemoteObjects.prototype.execHooks) (console.log(type))
  CustomerModel.afterRemote('prototype.patchAttributes', async function(ctx, instance) {

    console.log(instance.timezoneId);

    return customerService.assignCustomerRoles(instance.id, ctx.req.body.roles)
      .then(() => {
        const initiatorId = customerService.getCustomerIdByToken(ctx.req.accessToken);
        return activityLogService.logCustomerUpdate(initiatorId, instance.id, instance.id)
      })
      .catch(err => {
        console.error(err, 'occurred');
      });
  });

  CustomerModel.checkGoogleAuth = function(ctx) {
    const customerId = customerService.getCustomerIdByToken(ctx.req.accessToken);
    return googleApiService.testAuth(customerId);
  };

  CustomerModel.authGoogle = function(ctx) {
    const customerId = customerService.getCustomerIdByToken(ctx.req.accessToken);

    return googleApiService.getAuthUrl(customerId);

    // FIXME
    // run server that will wait for response

  };

  CustomerModel.handleGoogleAuthRedirect = function(ctx) {

    return new Promise((resolve, reject) => {

      console.log('We have received', ctx.req.url);

      // FIXME: + customerId!!

      // FIXME
      const qs = new url.URL(ctx.req.url, configService.getValue('googleApiService.redirectUrl'))
        .searchParams;

      console.log('Qs is:', qs);
      console.log('Code is:', qs.get('code'));
      console.log('State param is', qs.get('state'));

      try {
        console.log('State (decoded) param is', googleApiService.decodeState(qs.get('state')));
      } catch(err) {
        ;
      }

      let json;
      try {
        json = googleApiService.decodeState(qs.get('state'));
      } catch (err) {
        console.err(err);
        resolve('Unable to retrieve state param from Google\'s response');
      }

      const customerId = json.customerId;

      if (!customerId) {
        resolve('Unable to retrieve customerId from state param');
      }

      // I know, this is ugly :(
      let tokens = null;

      googleApiService.getTokensFromCode(customerId, qs.get('code'))
        .then(result => {
          console.log('Tokens:', result.tokens);
          console.log('Access token:', result.tokens.access_token);

          if (result.tokens.access_token) {
            return result.tokens;
          } else {
            return false;
          }
        }).then(resTokens => {

        if (resTokens) {
          tokens = resTokens;

          return CustomerModel.findById(customerId)
        } else {
          console.log('There is no tokens in response :(');
          return false;
        }
      }).then(customer => {

        if (customer) {
          // CHECKME: Perhaps we can ommit this due to "onTokens" event in google-api... No eto ne tochno ))
          return customer.updateAttributes({
            google_api_access_token: tokens.access_token,
            google_api_refresh_token: tokens.refresh_token
          }).then(() => {
            console.log('Hooray (1)!');
            return true;
          }).catch(err => {
            // throw err;
            console.error('Occurred err:', err);
            throw err;
            // resolve('Something went wrong, try again later :(');
          });

        } else {
          return false;
        }

      }).then(res => {

          console.log('Res is', res);

          if(res) {
            resolve('Successfully authorized!');
          } else {
            resolve('Something went wrong, try again :(');
          }

        }).catch(err => {
          console.error(err);
          resolve('Something went wrong, try again later :(');
        });
    });


    // generate auth url

    // run server that will wait for response

  };

  CustomerModel.remoteMethod('checkGoogleAuth', {
    accepts: [{arg: 'ctx', type: 'object', 'http': {source: 'context'}}],
    http: {verb: 'get'},
    returns: { arg: 'status', type: 'boolean'},
  });

  CustomerModel.remoteMethod('authGoogle', {
    accepts: [{arg: 'ctx', type: 'object', 'http': {source: 'context'}}],
    http: {verb: 'get'},
    returns: { arg: 'url', type: 'string'},
  });

  CustomerModel.remoteMethod('handleGoogleAuthRedirect', {
    accepts: [{arg: 'ctx', type: 'object', 'http': {source: 'context'}}],
    http: {verb: 'get'},
    returns: { arg: 'data', type: 'string', root: true},
  });

};
