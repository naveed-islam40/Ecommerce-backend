const nodeMailer = require("nodemailer");
require("dotenv").config();

const sendMail = async ({ email, message, subject }) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

const contactUsMail = async ({ email, message, subject }) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_CONTACT_PAGE,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.SMPT_MAIL,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error in email send", error);
  }
};

module.exports = { sendMail, contactUsMail };
