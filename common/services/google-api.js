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
              this.storeCustomerCredentials(customer, tokens);
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
          access_token: customer.googleApiAccessToken,
          refresh_token: customer.googleApiRefreshToken,
        }
      });
  }

  getCustomerByRefreshToken(refreshToken) {
    const customerModel = app.models.Customer;
    return customerModel.find({where: {googleApiRefreshToken: refreshToken}});
  }

  storeCustomerCredentials(customer, tokens) {

    return customer.updateAttributes({
      googleApiAccessToken: tokens.access_token,
      googleApiRefreshToken: tokens.refresh_token
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
              singleEvents: false,
            }, (err, res) => {

              if (err) {
                console.log('Ne aljo', err);
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

  getCalendarEvents(customerId, startDate, endDate, isIncludeEventTitles = false){
    // db is alias for memory datasource
    const memory = app.dataSources.db;
    const GeneralEvent = memory.buildModelFromInstance(
      'GeneralEvent',
      {
        id: null
      },
      {idInjection: true}
    );

    // Test auth by trying to read user's calendar
    return this.getAuthorizedClient(customerId)
      .then(auth => {

        if (!auth) {
          return [];
          // means not authorized

        } else {
          // try to execute simple request
          const calendar = google.calendar({version: 'v3', auth});
          const serachOwnEventsString = this.getConfigService().getValue('general.siteShortName').toLowerCase();

          return new Promise((resolve) => {
            calendar.events.list({
              calendarId: 'primary',
              timeMin: startDate.toISOString(),
              timeMax: endDate.toISOString(),
              // CHECKME
              maxResults: 250,
              singleEvents: true
            }, (err, res) => {

              if (err) {
                console.log('Ne aljo', err);
                resolve(false);

              } else {

                const stack = [];

                for (const item of res.data.items) {
                  // this is not callan lesson
                  console.log(item);

                  if ((item.summary && item.summary.toLowerCase().indexOf(serachOwnEventsString) === -1) && item.start && item.end) {
                    const generalEvent = new GeneralEvent();
                    generalEvent.startTime = item.start.dateTime;
                    generalEvent.endTime = item.end.dateTime;

                    if (isIncludeEventTitles) {
                      generalEvent.title = item.summary;
                    }

                    stack.push(generalEvent);
                  }
                }

                resolve(stack);
              }
            });
          });
        }
      });
  }

  createLessonCalendarEvent(lessonEventId, targetCustomerId, studentId) {

    const LessonEventModel = app.models.LessonEvent;
    const customerModel = app.models.Customer;

    return Promise.all([this.getAuthorizedClient(targetCustomerId), customerModel.findById(studentId), LessonEventModel.findById(lessonEventId, {include: ['Student', 'Teacher']})])
    // First, get authorized customer (teacher)
      .then(results => {

        const [auth, student, lessonEventObj] = results;
        const lessonEvent = lessonEventObj.toJSON();

        let attendeesData = [];

        if (student) {
          attendeesData.push({
            email: student.email,
            displayName: student.firstName + ' ' + student.lastName,
          });
        }

        const teacher = lessonEvent.Teacher;

        if (teacher) {
          attendeesData.push({
            email: teacher.email,
            displayName: teacher.firstName + ' ' + teacher.lastName,
          });
        }

        if (!auth) {
          return false;
          // means not authorized

        } else {
          const calendar = google.calendar({version: 'v3', auth});
          const lessonTitle = this.createLessonEventCalendarTitle(lessonEvent);
          const endTime = new Date(lessonEvent.startTime.getTime() + lessonEvent.duration * 60000);

          const event = {
            'summary': lessonTitle,
            'description': student.description,
            'start': {
              'dateTime': lessonEvent.startTime,
            },
            'end': {
              'dateTime': endTime,
            },
            'attendees': attendeesData,
            'reminders': {
              'useDefault': false,
              'overrides': [
                {'method': 'email', 'minutes': 60},
                {'method': 'popup', 'minutes': 60},
                {'method': 'popup', 'minutes': 10},
              ],
            },
          };

          return new Promise((resolve) => {
            calendar.events.insert({
              auth: auth,
              calendarId: 'primary',
              resource: event,
            }, function(err, response) {
              if (err) {
                console.error('There was an error contacting the Calendar service: ' + err);
                resolve(false);
              } else {
                // strange that insert returns container with status, statusText instead of event itself..
                const createdEvent = response.data;
                resolve(createdEvent);
              }
            });
          });
        }
      }).catch(err => {
        console.error('Error inserting this lesson event :(');
        throw err;
      });
  }

  deleteLessonCalendarEvent(calendarEventId, targetCustomerId) {

    this.getAuthorizedClient(targetCustomerId)
      .then(auth => {

        if (!auth) {
          return false;
          // means not authorized
        } else {
          const calendar = google.calendar({version: 'v3', auth});

          return new Promise((resolve) => {
            calendar.events.delete({
              auth: auth,
              calendarId: 'primary',
              eventId: calendarEventId
            }, function(err, response) {
              if (err) {
                console.error('There was an error contacting the Calendar service: ' + err);
                resolve(false);
              } else {
                // strange that insert returns container with status, statusText instead of event itself..
                console.log('Sucсessfully deleted!', response);
                resolve(true);
              }
            });
          });
        }
      }).catch(err => {
        console.error('Error inserting this lesson event :(');
        throw err;
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

  getConfigService() {
    const container = require('../conf/configure-container');
    return container.resolve('configService');
  }

}

module.exports = GoogleApiService;
