// // send_mail.js
// const nodemailer = require("nodemailer");

// // ✅ Create a pooled transporter for faster reuse
// const transporter = nodemailer.createTransport({
//   pool: true,
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "tushargangarde28@gmail.com",
//     pass: "wsll kjgp vfuk aypc", // Gmail app password
//   },
//   maxConnections: 5, // Up to 5 parallel connections
//   maxMessages: 100,  // Reuse connection for multiple messages
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// const send_mail = async (to, subject, htmlContent) => {
//   try {
//     const info = await transporter.sendMail({
//       from: '"A2toZ Job Portal" <tushargangarde28@gmail.com>',
//       to,
//       subject,
//       html: htmlContent,
//     });
//     console.log(`✅ Email sent to ${to} (${info.messageId})`);
//   } catch (err) {
//     console.error(`❌ Failed to send email to ${to}:`, err.message);
//   }
// };

// module.exports = send_mail;

// send_mail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "tushargangarde28@gmail.com",
    pass: "wsll kjgp vfuk aypc",
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  connectionTimeout: 30000, // 30 s
  socketTimeout: 30000,     // 30 s
  tls: { rejectUnauthorized: false },
});

const send_mail = async (to, subject, html) => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: '"A2toZ Job Portal" <tushargangarde28@gmail.com>',
        to,
        subject,
        html,
      });
      console.log(`✅ Sent to ${to} (attempt ${attempt})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Attempt ${attempt} failed for ${to}:`, err.message);
      if (attempt === 2) console.error(`❌ Giving up on ${to}`);
      else await new Promise(r => setTimeout(r, 2000)); // small delay before retry
    }
  }
};

module.exports = send_mail;
