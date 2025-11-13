//External Lib Import
const nodemailer = require("nodemailer");

const SendMailUtility = async (emailTo, emailText, emailSubject) => {
  let transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com", // ✅ Correct mail server host
    port: 587, // ✅ Use 587 for TLS with Gmail
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USERNAME, // e.g., your full Gmail address
      pass: process.env.EMAIL_PASSWORD, // App password or Gmail password (if allowed)
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOption = {
    from: `${process.env.APPLICATION_NAME} <${process.env.EMAIL_USERNAME}>`,
    to: emailTo,
    subject: emailSubject,
    html: emailText,
  };

  return await transporter.sendMail(mailOption);
};

module.exports = SendMailUtility;


