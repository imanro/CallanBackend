'use strict';

var app = require('../../server/server');
const {google} = require('googleapis');

// FIXME: on refresh!!
class GoogleApiService {

  getOAuth2Client() {
    const container = this.getServiceContainer();
    /** @type ConfigService */
    const configService = container.resolve('configService');

    console.log('auth values is follow:', configService.getValue('googleApiService.clientId'),
      configService.getValue('googleApiService.clientSecret'),
      configService.getValue('googleApiService.redirectUrl'));

    const client =  new google.auth.OAuth2(
      configService.getValue('googleApiService.clientId'),
      configService.getValue('googleApiService.clientSecret'),
      configService.getValue('googleApiService.redirectUrl')
    );

    // try to auto update tokens
    this.setUpdateTokens(client);

    return client;
  }

  setUpdateTokens(client) {
    client.on('tokens', (tokens) => {

      if (tokens.refresh_token) {
        this.getCustomerByRefreshToken(tokens.refresh_token)
          .then(customer => {
            if (customer) {
              this.storeCustomerCredentials(tokens);
            }
        });
      }
    });
  }

  getAuthScopes() {
    return ['https://www.googleapis.com/auth/calendar'];
  }

  getStoredCredentials(customerId) {
    const customerModel = app.models.Customer;

    return customerModel.findById(customerId)
      .then(customer => {
        return {
          access_token: customer.google_api_access_token,
          refresh_token: customer.google_api_refresh_token,
        }
      });
  }

  getCustomerByRefreshToken(refreshToken) {
    const customerModel = app.models.Customer;
    return customerModel.find({where: {google_api_refresh_token: refreshToken}});
  }

  storeCustomerCredentials(customer, tokens) {
    return customer.updateAttributes({
      google_api_access_token: tokens.access_token,
      google_api_refresh_token: tokens.refresh_token
    });
  }

  getRedirectUriPort() {
    const container = require('../conf/configure-container');
    const configService = container.resolve('configService');
    /** @type ConfigService */
    const parts = configService.getValue('googleApiService.redirectUrl').split(':');
    return parts[1];
  }

  getServiceContainer() {
    return require('../conf/configure-container');
  }

  getTokensFromCode(customerId, code) {
    const auth = this.getOAuth2Client();
    // FIXME!
    // const testCode = '4/wQAD7oclybXstzPLpvswu4CVZGYRa3Y3q1r32LMueyv3LBNoWpNY6KIEEsCZoFQpq9ZRFcrY2MF3nje7TtJQctY';
    return auth.getToken(code);
  }

  getAuthorizedClient(customerId) {
    const auth = this.getOAuth2Client(customerId);
    return this.getStoredCredentials(customerId)
      .then(creds => {
        console.log(creds);

        if (creds.access_token || creds.refresh_token) {
          auth.setCredentials(creds);
          return true;
        } else {
          return false;
        }
      }).then(res => {
        if (!res) {
          console.log('Something is wrong with the creds');
          return false;

        } else {
          return auth;
        }
      });
  }

  getAuthUrl(customerId) {
    return new Promise((resolve) => {
      const auth = this.getOAuth2Client();
      const url =  auth.generateAuthUrl({
        access_type: 'offline',
        scope: this.getAuthScopes().join(' '),
        prompt: 'consent', // FIXME
        state: this.encodeState({customerId: customerId}),
      });

      console.log(url, 'Generated');
      resolve(url);
    });
  }

  testAuth(customerId){
    // Test auth by trying to read user's calendar
    return this.getAuthorizedClient(customerId)
      .then(auth => {

        if (!auth) {
          return false;
          // means not authorized

        } else {
          // try to execute simple request
          const calendar = google.calendar({version: 'v3', auth});

          return new Promise((resolve) => {
            calendar.events.list({
              calendarId: 'primary',
              timeMin: (new Date()).toISOString(),
              maxResults: 1,
              singleEvents: true,
              orderBy: 'startTime',
            }, (err, res) => {

              if (err) {
                console.log('Ne aljo');
                resolve(false);

              } else {

                console.log('Hooray!');

                if (res.data.items.length > 0) {
                  console.log('Items:', res.data.items[0]);
                }

                resolve(true);
              }
            });
          });
        }
      });
  }

  createLessonCalendarEvent(customerId, lessonEventId) {

    return this.getAuthorizedClient(customerId)
    // First, get authorized customer (teacher)
      .then(auth => {

        if (!auth) {
          return false;
          // means not authorized

        } else {
          const calendar = google.calendar({version: 'v3', auth});
          const LessonEventModel = app.models.LessonEvent;

          return LessonEventModel.findById(lessonEventId, {include: ['Student', 'Teacher']})
            .then(result => {

              const lessonEvent = result.toJSON();
              const lessonTitle = this.createLessonEventCalendarTitle(lessonEvent);
              const endTime = new Date(lessonEvent.startTime.getTime() + lessonEvent.duration * 60000);

              const event = {
                'summary': lessonTitle,
                'start': {
                  'dateTime': lessonEvent.startTime,
                },
                'end': {
                  'dateTime': endTime,
                },
                'reminders': {
                  'useDefault': false,
                  'overrides': [
                    {'method': 'email', 'minutes': 60},
                    {'method': 'popup', 'minutes': 10},
                  ],
                },
              };

              return new Promise((resolve) => {
                calendar.events.insert({
                  auth: auth,
                  calendarId: 'primary',
                  resource: event,
                }, function(err, event) {
                  if (err) {
                    console.error('There was an error contacting the Calendar service: ' + err);
                    resolve(false);
                  } else {
                    console.log('Event created: %s', event);
                    resolve(true);
                  }
                });
              });
            }).catch(err => {
              console.error('Error inserting this lesson event :(');
              throw err;
            });
        }

      });
  }

  encodeState(json) {
    return Buffer.from(JSON.stringify(json)).toString('base64');
  }

  decodeState(value) {
    return JSON.parse(Buffer.from(value, 'base64').toString('ascii'));
  }

  createLessonEventCalendarTitle(lessonEvent) {
    const container = this.getServiceContainer();
    /** @type ConfigService */
    const configService = container.resolve('configService');

    if (lessonEvent.Student && lessonEvent.Teacher) {
      return lessonEvent.Student.firstName + ' <> ' + lessonEvent.Teacher.firstName +
        ' (' + configService.getValue('general.siteShortName') + ' Lesson' + ')';
    } else {
      return configService.getValue('general.siteShortName') + ' Lesson';
    }
  }

}

module.exports = GoogleApiService;
