'use strict';

const moment = require('moment-timezone');

const app = require('../../server/server');

class MailNotificationService {

  notifyTeacherLessonEventCreated(lessonEventId) {
    const container = require('../conf/configure-container');

    return this.getLessonEvent(lessonEventId)
      .then(result => {

        const lessonEvent = result.toJSON();

        if (lessonEvent.Teacher) {

          let timezone;

          if (lessonEvent.Teacher) {
            timezone = lessonEvent.Teacher.Timezone;
          } else {
            timezone = null;
          }

          const text = this.getLessonEventInfo(lessonEvent, timezone, true, false, false);
          console.log('We\'ve prepared', text + this.getSignature());

          return this.getMailerService().sendMail({
            'to': lessonEvent.Teacher.email,
            'from': this.getConfigService().getValue('mailerService.from'),
            'subject': 'You have the new Lesson',
            'text': text + this.getSignature(),
          });
        } else {
          return false;
        }

      });
  }

  notifyCustomerCreated(customerId) {
    return this.getCustomer(customerId)
      .then(result => {
        const customer = result.toJSON();

        const text = `Congratulations, ${customer.firstName}!\n\n` +
          'You have been registered on ' + this.getConfigService().getValue('general.siteShortName') + `.\n` +
            `Now you can log in there using the link below.`;

        return this.getMailerService().sendMail({
          'to': customer.email,
          'from': this.getConfigService().getValue('mailerService.from'),
          'subject': 'Registration on ' + this.getConfigService().getValue('general.siteShortName'),
          'text': text + this.getSignature(),
        });
      });
  }

  notifyBalanceSupplied(courseProgressId) {
    return this.getCourseProgress(courseProgressId)
      .then(result => {
        const courseProgress = result.toJSON();
        const customer = courseProgress.Customer;
        const course = courseProgress.Course;

        if (!customer || !course) {
          console.error('There is no related models in the courseProgress model');
          return true;

        } else {
          const text = `Hello, ${customer.firstName}!\n\n` +
            `Your balance was supplied, and now you have ${courseProgress.lessonEventsBalance} lesson(s) in your account for the course ${course.title}.\n` +
            `Now you can plan your next lesson.`;

          return this.getMailerService().sendMail({
            'to': customer.email,
            'from': this.getConfigService().getValue('mailerService.from'),
            'subject': 'Balance supplied on ' + this.getConfigService().getValue('general.siteShortName'),
            'text': text + this.getSignature(),
          });
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

  getCustomer(id) {
    const customerModel = app.models.Customer;
    return customerModel.findById(id, {include: ['Timezone']});
  }

  getLessonEvent(id) {
    const lessonEventModel = app.models.LessonEvent;
    return lessonEventModel.findById(id, {include: [{Teacher: ['Timezone']}, {Student: ['Timezone']}, {CourseProgress: ['Course']}, {Lesson: ['Course']}]});
  }

  getCourseProgress(id) {
    const CourseProgressModel = app.models.CourseProgress;
    return CourseProgressModel.findById(id, {include: ['Course', 'Customer']});
  }

  /**
   * @return CustomerService
   */
  getCustomerService() {
    const container = require('../conf/configure-container');
    return container.resolve('customerService');
  }

  /**
   * @return ConfigService
   */
  getConfigService() {
    const container = require('../conf/configure-container');
    return container.resolve('configService');
  }

  /**
   * @return MailerService
   */
  getMailerService() {
    const container = require('../conf/configure-container');
    return container.resolve('mailerService');
  }

  getSignature() {
    return `\n\n----\n` + this.getConfigService().getValue('general.siteName') + `\n` + this.getConfigService().getValue('general.siteUrl');
  }


}

module.exports = MailNotificationService;
