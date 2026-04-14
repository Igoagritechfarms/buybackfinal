import { verifyOtpSession } from '../server/otpService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId =
    typeof req.body?.sessionId === 'string' ? req.body.sessionId.trim() : '';
  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
  const verification = verifyOtpSession({ sessionId, otp });

  if (!verification.ok) {
    return res.status(verification.status).json({
      error: verification.error,
      attemptsRemaining: verification.attemptsRemaining,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'OTP verified successfully.',
    phone: verification.e164Phone,
    role: verification.role,
    verifiedAt: verification.verifiedAt,
  });
}
