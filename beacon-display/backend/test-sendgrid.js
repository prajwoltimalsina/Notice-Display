require('dotenv').config();
const sgMail = require("@sendgrid/mail");

if (!process.env.SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY is not defined in .env");
  process.exit(1);
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  console.error("SENDGRID_FROM_EMAIL is not defined in .env");
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: process.env.SENDGRID_FROM_EMAIL, // Send it to yourself to verify it works
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: "Test Email from Notice Board Backend",
  text: "Hello from your app! SendGrid is working properly.",
  html: "<strong>Hello from your app!</strong><br/>SendGrid is working properly.",
};

console.log(`Attempting to send email to ${msg.to}...`);

sgMail.send(msg)
  .then(() => {
    console.log("✅ Email sent successfully");
  })
  .catch((err) => {
    console.error("❌ Error sending email:", err);
    if (err.response) {
      console.error(err.response.body);
    }
  });
