import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isDevMode = () =>
  !process.env.SMTP_USER ||
  process.env.SMTP_USER === 'your-email@gmail.com' ||
  process.env.SMTP_USER.trim() === '';

let transporter = null;
if (!isDevMode()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendEmail({ to, subject, html }) {
  if (isDevMode()) {
    console.log(`\n✉️  [DEV MODE] Email to ${to}\nSubject: ${subject}\n\n`);
    return { success: true, message: 'Logged to console (Dev Mode)' };
  }

  try {
    await transporter.sendMail({
      from: `"Referr'd" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error('[sendEmail]', err.message);
    return { success: false, error: err.message };
  }
}
