'use strict';

const app = require('../../server/server');

var mailer = require('nodemailer');

class MailerService {

  getTransport() {

    console.log('get transp?');

    const container = require('../conf/configure-container');

    /** @type ConfigService */
    const configService = container.resolve('configService');

    if (!this.transport) {
      console.log('no transp?');
      this.setTransport(
        mailer.createTransport({
          host: configService.getValue('mailerService.host'),
          port: configService.getValue('mailerService.port'),
          secure: configService.getValue('mailerService.secure'),
          auth: {
            user: configService.getValue('mailerService.user'),
            pass: configService.getValue('mailerService.password'),
          },
        }));
    }

    console.log('the transport now is', this.transport);

    return this.transport;
  }

  setTransport(transport) {
    this.transport = transport;
  }

  sendMail(mail) {
    return this.getTransport().sendMail(mail);
  }
}

module.exports = MailerService;
