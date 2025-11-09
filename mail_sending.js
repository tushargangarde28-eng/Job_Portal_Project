// send_mail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // ✅ correct port for TLS
  secure: false, // ✅ must be false for port 587
  auth: {
    user: "tushargangarde28@gmail.com", // ✅ your Gmail ID
    pass: "wsll kjgp vfuk aypc",        // ✅ your Gmail app password (not normal password)
  },
});

const send_mail = async (to, subject, htmlContent) => {
  const info = await transporter.sendMail({
    from: '"A2toZ Job Portal" <tushargangarde28@gmail.com>', // ✅ sender name
    to: to,       // ✅ receiver(s)
    subject: subject,
    html: htmlContent,
  });
  console.log("Mail sent:", info.messageId);
};

module.exports = send_mail;
