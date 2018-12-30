'use strict';

const moment = require('moment-timezone');

const app = require('../../server/server');

class MailNotificationService {

  notifyTeacherLessonEventCreated(id) {
    const container = require('../conf/configure-container');

    return this.getLessonEvent(id)
      .then(result => {

        const lessonEvent = result.toJSON();

        if (lessonEvent.Teacher) {

          let timezone;

          if (lessonEvent.Teacher) {
            timezone = lessonEvent.Teacher.Timezone;
          } else {
            timezone = null;
          }

          const data = this.getLessonEventInfo(lessonEvent, timezone, true, false, false);
          console.log('We\'ve prepared', data + this.getSignature());

          const configService = container.resolve('configService');
          /** @type ConfigService */

          const mailerService = container.resolve('mailerService');
          /** @type MailerService */

          return mailerService.sendMail({
            'to': lessonEvent.Teacher.email,
            'from': configService.getValue('mailerService.from'),
            'subject': 'You have the new Lesson',
            'text': data + this.getSignature(),
          });
        } else {
          return false;
        }

      });

  }

  getCustomerFormattedInfo(customer, isContactsShown = false) {
    let data = `${customer.firstName} ${customer.lastName}`;

    if (isContactsShown) {
      data += ` <${customer.email}>`;
    }

    return data;
  }

  getLessonEventInfo(lessonEvent, timezone = null, isStudentInfo = false, isTeacherInfo = false, isContactShown = false) {

    console.log('LEC', lessonEvent.CourseProgress, lessonEvent.CourseProgress.Course);

    let data = '';

    if (lessonEvent.CourseProgress && lessonEvent.CourseProgress.Course) {
      data += `Course: ${lessonEvent.CourseProgress.Course.title}\n`;
    }

    data += `Start time: ` + this.getFormattedDate(lessonEvent.startTime, timezone);

    if (isStudentInfo && lessonEvent.Student) {
      data += `\nStudent: ` + this.getCustomerFormattedInfo(lessonEvent.Student, isContactShown);
    }

    if (isTeacherInfo && lessonEvent.Teacher) {
      data += `\nTeacher: ` + this.getCustomerFormattedInfo(lessonEvent.Teacher, isContactShown);
    }

    return data;
  }

  getFormattedDate(date, timezone = null) {

    console.log(date, 'to format');

    if (timezone) {
      console.log('Get time in timezone');
      return moment(date).tz(timezone.name).format('M/DD/YYYY h:mm A');
    } else {
      console.log('User is not uses a timezone yet, get in GMT...');
      return moment(date).tz('GMT').format('M/DD/YYYY h:mm A Z');
    }
  }

  getLessonEvent(id) {
    const lessonEventModel = app.models.LessonEvent;
    return lessonEventModel.findById(id, {include: [{Teacher: ['Timezone']}, {Student: ['Timezone']}, {CourseProgress: ['Course']}, {Lesson: ['Course']}]});
  }

  getSignature() {
    const container = require('../conf/configure-container');
    const configService = container.resolve('configService');
    return `\n\n----\n` + configService.getValue('general.siteName');
  }


}

module.exports = MailNotificationService;
