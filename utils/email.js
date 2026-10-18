import nodemailer from 'nodemailer';
import {
  CONTACT_TO_EMAIL,
  MAIL_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from '../config.js';

let transporter;

export const isEmailConfigured = () => Boolean(
  SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_FROM && CONTACT_TO_EMAIL,
);

const getTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error('SMTP email delivery is not configured');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return transporter;
};

export const sendContactMessage = ({ name, email, title, message }) => getTransporter().sendMail({
  from: MAIL_FROM,
  to: CONTACT_TO_EMAIL,
  replyTo: email,
  subject: `Portfolio contact: ${title}`,
  text: `Name: ${name}\nEmail: ${email}\nSubject: ${title}\n\n${message}`,
});

export const sendBookingNotifications = async ({ name, email, note, startAt, timezone }) => {
  const meetingTime = new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(startAt);
  const details = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Meeting: ${meetingTime} (${timezone})`,
    note ? `Note: ${note}` : '',
  ].filter(Boolean).join('\n');
  const mailer = getTransporter();

  await Promise.all([
    mailer.sendMail({
      from: MAIL_FROM,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New portfolio meeting booking: ${name}`,
      text: details,
    }),
    mailer.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: 'Your portfolio meeting is booked',
      text: `Hello ${name},\n\nYour online meeting is booked for ${meetingTime} (${timezone}).\n\n${note ? `Your note: ${note}\n\n` : ''}Thank you!`,
    }),
  ]);
};
