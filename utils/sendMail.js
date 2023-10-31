const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.HOST_EMAIL,
    port: process.env.PORT_EMAIL,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.PASSWORD_EMAIL
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text
  }

  return await transport.sendMail(mailOptions);
}

module.exports = sendMail;
