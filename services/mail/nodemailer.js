import nodemailer from 'nodemailer';

let transporter;

const buildTransportOptions = () => {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.NODEMAILER_APP_EMAIL;
  const pass = process.env.NODEMAILER_APP_PASSWORD;

  if (!host) {
    throw new Error('SMTP_HOST is required');
  }

  const options = {
    host,
    port,
    secure,
  };

  if (user && pass) {
    options.auth = { user, pass };
  }

  return options;
};

export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(buildTransportOptions());
  }

  return transporter;
};

export const verifySMTPConnection = async () => {
  const smtp = getTransporter();
  await smtp.verify();
  console.log('✅ SMTP server connection verified');
};
