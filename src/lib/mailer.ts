import sgMail from '@sendgrid/mail';

const isProd = process.env.NODE_ENV === 'production';
const baseURL = isProd ? process.env.NEXT_PUBLIC_AP_URL : 'http://localhost:3000';
const sendgridApiKey = process.env.SEND_API_KEY;
const senderEmail = process.env.SENDER_EMAIL;

if (!sendgridApiKey) {
  throw new Error('SEND_API_KEY is not set in the environment variables');
}

if (!senderEmail) {
  throw new Error('SENDER_EMAIL is not set in the environment variables');
}

sgMail.setApiKey(sendgridApiKey);

const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = {
    to,
    from: senderEmail,
    subject,
    html,
  };

  try {
    if (isProd) {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } else {
      console.log('Development mode: Email not sent');
      console.log('Email details:', { to, subject, html });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${baseURL}/new-verification?token=${token}`;
  const subject = "Confirm your email";
  const html = `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`;
  
  await sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${baseURL}/new-password?token=${token}`;
  const subject = "Reset your password";
  const html = `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`;

  await sendEmail(email, subject, html);
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const subject = "2FA Code";
  const html = `<p>Your 2FA code: ${token}.</p>`;

  await sendEmail(email, subject, html);
};