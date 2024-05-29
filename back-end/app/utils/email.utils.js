const nodemailer = require('nodemailer');
const config = require('../config/index');

const sendEmail = async (option) => {
    const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        auth: {
            user: config.email.user,
            pass: config.email.password,
        }
    });

    const emailOptions = {
        from: 'Truong chinh tri Thanh Pho Can Tho <tct@gmail.com>',
        to: option.email,
        subject: option.subject,
        html: option.html,
    };

    await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;