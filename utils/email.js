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

const getEmailLocale = (locale) => (
  typeof locale === 'string' && /^(uk|ua)(-|$)/i.test(locale) ? 'uk-UA' : 'en-US'
);

export const sendContactMessage = ({ name, email, title, message, locale }) => {
  const isUkrainian = getEmailLocale(locale) === 'uk-UA';
  return getTransporter().sendMail({
    from: MAIL_FROM,
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `${isUkrainian ? 'Звернення з портфоліо' : 'Portfolio contact'}: ${title}`,
    text: isUkrainian
      ? `Ім’я: ${name}\nEmail: ${email}\nТема: ${title}\n\n${message}`
      : `Name: ${name}\nEmail: ${email}\nSubject: ${title}\n\n${message}`,
  });
};

export const sendBookingNotifications = async ({ name, email, note, startAt, timezone, locale }) => {
  const emailLocale = getEmailLocale(locale);
  const isUkrainian = emailLocale === 'uk-UA';
  const meetingTime = new Intl.DateTimeFormat(emailLocale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'long',
    timeZone: timezone,
  }).format(startAt);
  const details = [
    `${isUkrainian ? 'Ім’я' : 'Name'}: ${name}`,
    `Email: ${email}`,
    `${isUkrainian ? 'Зустріч' : 'Meeting'}: ${meetingTime}`,
    note ? `${isUkrainian ? 'Примітка' : 'Note'}: ${note}` : '',
  ].filter(Boolean).join('\n');
  const mailer = getTransporter();

  await Promise.all([
    mailer.sendMail({
      from: MAIL_FROM,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `${isUkrainian ? 'Нове бронювання зустрічі на портфоліо' : 'New portfolio meeting booking'}: ${name}`,
      text: details,
    }),
    mailer.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: isUkrainian ? 'Вашу зустріч заброньовано' : 'Your portfolio meeting is booked',
      text: isUkrainian
        ? `Вітаю, ${name}!\n\nВашу онлайн-зустріч заброньовано на ${meetingTime}.\n\n${note ? `Ваша примітка: ${note}\n\n` : ''}Дякую!`
        : `Hello ${name},\n\nYour online meeting is booked for ${meetingTime}.\n\n${note ? `Your note: ${note}\n\n` : ''}Thank you!`,
    }),
  ]);
};
