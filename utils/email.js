import nodemailer from 'nodemailer';
import {
  CONTACT_TO_EMAIL,
  MAIL_FROM,
  PUBLIC_SITE_URL,
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

export const sendBookingNotifications = async ({ name, email, note, startAt, timezone, locale, meetUrl, responseToken }) => {
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
    `Google Meet: ${meetUrl}`,
    `${isUkrainian ? 'Відповідь учасника' : 'Attendee response'}: ${isUkrainian ? 'Очікується' : 'Pending'}`,
    note ? `${isUkrainian ? 'Примітка' : 'Note'}: ${note}` : '',
  ].filter(Boolean).join('\n');
  const mailer = getTransporter();
  const responseUrl = `${PUBLIC_SITE_URL}/booking/respond?token=${encodeURIComponent(responseToken)}&locale=${encodeURIComponent(emailLocale)}`;

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
        ? `Вітаю, ${name}!\n\nВашу онлайн-зустріч заброньовано на ${meetingTime}.\n\nПосилання на Google Meet: ${meetUrl}\n\nПідтвердите участь у зустрічі? Відкрийте посилання, щоб підтвердити або відмовитися: ${responseUrl}\n\n${note ? `Ваша примітка: ${note}\n\n` : ''}Дякую!`
        : `Hello ${name},\n\nYour online meeting is booked for ${meetingTime}.\n\nGoogle Meet link: ${meetUrl}\n\nWill you attend the meeting? Open this link to confirm or decline: ${responseUrl}\n\n${note ? `Your note: ${note}\n\n` : ''}Thank you!`,
    }),
  ]);
};
