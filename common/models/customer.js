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
/** @type MailNotificationService */
const mailNotificationService = container.resolve('mailNotificationService');

const url = require('url');

var g = require('loopback/lib/globalize');
var debug = require('debug')('loopback:user');

module.exports = function(CustomerModel) {

  CustomerModel.login = function(credentials, include, fn) {
    var self = this;
    if (typeof include === 'function') {
      fn = include;
      include = undefined;
    }

    fn = fn || utils.createPromiseCallback();

    include = (include || '');
    if (Array.isArray(include)) {
      include = include.map(function(val) {
        return val.toLowerCase();
      });
    } else {
      include = include.toLowerCase();
    }

    var realmDelimiter;
    // Check if realm is required
    var realmRequired = !!(self.settings.realmRequired ||
      self.settings.realmDelimiter);
    if (realmRequired) {
      realmDelimiter = self.settings.realmDelimiter;
    }
    var query = self.normalizeCredentials(credentials, realmRequired,
      realmDelimiter);

    if (realmRequired && !query.realm) {
      var err1 = new Error(g.f('{{realm}} is required'));
      err1.statusCode = 400;
      err1.code = 'REALM_REQUIRED';
      fn(err1);
      return fn.promise;
    }
    if (!query.email && !query.username) {
      var err2 = new Error(g.f('{{username}} or {{email}} is required'));
      err2.statusCode = 400;
      err2.code = 'USERNAME_EMAIL_REQUIRED';
      fn(err2);
      return fn.promise;
    }

    self.findOne({where: query}, function(err, user) {
      var defaultError = new Error(g.f('Login failed'));
      defaultError.statusCode = 401;
      defaultError.code = 'LOGIN_FAILED';

      function tokenHandler(err, token) {
        if (err) return fn(err);
        if (Array.isArray(include) ? include.indexOf('user') !== -1 : include === 'user') {
          // NOTE(bajtos) We can't set token.user here:
          //  1. token.user already exists, it's a function injected by
          //     "AccessToken belongsTo User" relation
          //  2. ModelBaseClass.toJSON() ignores own properties, thus
          //     the value won't be included in the HTTP response
          // See also loopback#161 and loopback#162
          token.__data.user = user;
        }
        fn(err, token);
      }

      if (err) {
        debug('An error is reported from User.findOne: %j', err);
        fn(defaultError);
      } else if (user) {
        user.hasPassword(credentials.password, function(err, isMatch) {
          if (err) {
            debug('An error is reported from User.hasPassword: %j', err);
            fn(defaultError);
          } else if (isMatch) {
            if (self.settings.emailVerificationRequired && !user.emailVerified) {
              // Fail to log in if email verification is not done yet
              debug('User email has not been verified');
              err = new Error(g.f('Login failed as the email has not been verified'));
              err.statusCode = 401;
              err.code = 'LOGIN_FAILED_EMAIL_NOT_VERIFIED';
              err.details = {
                userId: user.id,
              };
              fn(err);
            } else if(!user.isActive) {
              debug('User is not activated yet');
              err = new Error(g.f('Login failed as the customer is not activated yet'));
              err.statusCode = 401;
              err.code = 'LOGIN_FAILED_USER_IS_NOT_ACTIVE';
              err.details = {
                userId: user.id,
              };
              fn(err);
            } else {
              if (user.createAccessToken.length === 2) {
                user.createAccessToken(credentials.ttl, tokenHandler);
              } else {
                user.createAccessToken(credentials.ttl, credentials, tokenHandler);
              }
            }

          } else {
            debug('The password is invalid for user %s', query.email || query.username);
            fn(defaultError);
          }
        });
      } else {
        debug('No matching record is found for user %s', query.email || query.username);
        fn(defaultError);
      }
    });
    return fn.promise;
  };

  CustomerModel.afterRemote('create', async function(ctx, instance) {

    const initiatorId = customerService.getCustomerIdByToken(ctx.req.accessToken);

    return customerService.assignCustomerRoles(instance.id, ctx.req.body.roles)
      .then(() => {
        return activityLogService.logCustomerCreate(initiatorId, instance.id, instance.id)
      })
      .then(() => {
        console.log('Notify');
        return mailNotificationService.notifyCustomerCreated(instance.id);
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

  CustomerModel.getGoogleCalendarEvents = function(customerId, startDate, endDate) {
    return googleApiService.getCalendarEvents(customerId, startDate, endDate);
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
            googleApiAccessToken: tokens.access_token,
            googleApiRefreshToken: tokens.refresh_token
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

  CustomerModel.remoteMethod('getGoogleCalendarEvents', {
    accepts: [
      {arg: 'customerId', type: 'number', required: true},
      {arg: 'startDate', type: 'date'},
      {arg: 'endDate', type: 'date'},
    ],
    returns: {type: 'array', root: true},
    http: {verb: 'get'},
  });

};
