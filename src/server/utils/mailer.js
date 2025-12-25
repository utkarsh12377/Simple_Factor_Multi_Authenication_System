const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOtpEmail(to, otp) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL, // MUST BE VERIFIED IN SENDGRID
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    const response = await sgMail.send(msg);
    console.log("✅ OTP email sent successfully:", response[0].statusCode);
  } catch (err) {
    console.error("❌ SendGrid Error:", JSON.stringify(err.response?.body, null, 2));
    throw err; // important so frontend sees error
  }
}

module.exports = { sendOtpEmail };
