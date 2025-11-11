// send_mail.js
const nodemailer = require("nodemailer");

// ✅ Create a pooled transporter for faster reuse
const transporter = nodemailer.createTransport({
  pool: true,
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "tushargangarde28@gmail.com",
    pass: "wsll kjgp vfuk aypc", // Gmail app password
  },
  maxConnections: 5, // Up to 5 parallel connections
  maxMessages: 100,  // Reuse connection for multiple messages
  tls: {
    rejectUnauthorized: false,
  },
});

const send_mail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: '"A2toZ Job Portal" <tushargangarde28@gmail.com>',
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent to ${to} (${info.messageId})`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
  }
};

module.exports = send_mail;
