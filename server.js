import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  const code = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(email, { code, expiresAt });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your verification code',
      text: `Your verification code is ${code}`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p>`,
    });
    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ message: 'Failed to send OTP email' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ message: 'No code was requested for this email' });
  }

  if (record.expiresAt < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
  }

  if (record.code !== code) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  otpStore.delete(email);
  return res.json({ message: 'Email verified successfully' });
});

const PORT = Number(process.env.BACKEND_PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Email verification backend running on http://localhost:${PORT}`);
});
