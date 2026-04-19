import nodemailer from "nodemailer";

export async function sendGMail(data) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_APP_EMAIL,
        pass: process.env.NODEMAILER_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"xsam.in" <${process.env.NODEMAILER_APP_EMAIL}>`,
      to: process.env.RECEIVE_MAIL_TO,
      subject: data.newMessage.subject,
      text: data.newMessage,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: %s", info.messageId);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}
