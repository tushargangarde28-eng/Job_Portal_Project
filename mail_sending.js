const nodemailer = require("nodemailer");

// ✅ Create high-performance Gmail transporter with pooling
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tushargangarde28@gmail.com", // your Gmail ID
    pass: "wsll kjgp vfuk aypc",        // your Gmail App Password
  },
  pool: true,               // 🔹 Enable connection pooling
  maxConnections: 5,        // 🔹 Up to 5 concurrent SMTP connections
  maxMessages: 1000,        // 🔹 Reuse connections efficiently
  rateDelta: 1000,          // 🔹 Time frame (1s)
  rateLimit: 5,             // 🔹 Max 5 messages per second (safe for Gmail)
  connectionTimeout: 15000, // 🔹 Wait up to 15s for connection
  socketTimeout: 15000,     // 🔹 Wait up to 15s for socket
  tls: { rejectUnauthorized: false }, // Prevent self-signed cert errors
});

// ✅ Check if transporter is ready when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter not ready:", error.message);
  } else {
    console.log("✅ Email transporter connected and ready!");
  }
});

// ✅ Universal mail sender function with retry & resilience
const send_mail = async (to, subject, html) => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: '"A2toZ Job Portal" <tushargangarde28@gmail.com>',
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to} (Attempt ${attempt}) - ID: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`⚠️ Attempt ${attempt} failed for ${to}: ${err.message}`);

      // Handle Gmail rate limiting or temporary network errors
      if (attempt < 2) {
        console.log("⏳ Retrying in 2 seconds...");
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.error(`❌ Giving up on ${to}`);
      }
    }
  }
};

module.exports = send_mail;
