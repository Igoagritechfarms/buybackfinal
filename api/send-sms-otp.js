import {
  buildOtpMessage,
  createOrResendOtpSession,
  getOtpPolicy,
  invalidateOtpSession,
  sendSmsOtpMessage,
} from '../server/otpService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const testModeFlag =
    process.env.OTP_TEST_MODE ??
    process.env.VITE_OTP_TEST_MODE ??
    'false';
  const testMode = String(testModeFlag).toLowerCase() === 'true';
  const testPhone = String(process.env.OTP_TEST_PHONE || '1234567890').trim();
  const testOtp = String(process.env.OTP_TEST_OTP || '123456').trim();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const smsFrom = process.env.TWILIO_SMS_FROM;
  const otpTemplate = process.env.SMS_OTP_TEMPLATE;

  const countryCode =
    typeof req.body?.countryCode === 'string' ? req.body.countryCode.trim() : '+91';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const role =
    typeof req.body?.role === 'string' ? req.body.role.trim().toLowerCase() : 'user';
  const localPhone = phone.replace(/\D/g, '');
  const useTestBypass = testMode;
  const shouldUseFixedTestOtp = useTestBypass && localPhone === testPhone;

  const created = createOrResendOtpSession({
    countryCode,
    phone,
    role,
    // In test mode, bypass SMS provider for any valid number.
    // Keep a fixed OTP only for OTP_TEST_PHONE; all other numbers get a fresh OTP.
    allowTestNumber: useTestBypass,
    otpOverride: shouldUseFixedTestOtp ? testOtp : undefined,
  });
  if (!created.ok) {
    return res.status(created.status).json({
      error: created.error,
      retryAfterSeconds: created.retryAfterSeconds,
    });
  }

  if (useTestBypass) {
    console.log(
      `[OTP_TEST_MODE] SMS bypass for ${created.e164Phone}, OTP=${created.otp}, session=${created.sessionId}`
    );
  } else {
    if (!accountSid || !authToken || !smsFrom) {
      invalidateOtpSession(created.sessionId);
      return res.status(500).json({
        error:
          'SMS OTP service is not configured. Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_SMS_FROM.',
      });
    }

    const sendResult = await sendSmsOtpMessage({
      accountSid,
      authToken,
      smsFrom,
      toPhoneE164: created.e164Phone,
      body: buildOtpMessage(otpTemplate, created.otp, role),
    });

    if (!sendResult.ok) {
      invalidateOtpSession(created.sessionId);
      return res.status(sendResult.status).json({ error: sendResult.error });
    }
  }

  const policy = getOtpPolicy();
  return res.status(200).json({
    success: true,
    message: 'OTP sent successfully.',
    sessionId: created.sessionId,
    resendAfterSeconds: policy.resendAfterSeconds,
    expiresInSeconds: policy.expirySeconds,
    ...(useTestBypass && { testMode: true }),
  });
}
