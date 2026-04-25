/**
 * SMS OTP delivery service — Fast2SMS (India)
 *
 * Sign up free at https://www.fast2sms.com
 * Add FAST2SMS_API_KEY to your .env file.
 *
 * Without the key: OTP is printed to the terminal (dev fallback).
 */

/**
 * Send an OTP via Fast2SMS.
 * @param {string} phone  E.164 (+91XXXXXXXXXX) or 10-digit
 * @param {string} otp    6-digit OTP string
 * @returns {Promise<{ sent: boolean, dev?: boolean }>}
 */
export async function sendSmsOtp(phone, otp) {
  const apiKey = process.env['FAST2SMS_API_KEY'];
  const digits = String(phone).replace(/\D/g, '').slice(-10);

  // ── Dev fallback (no API key) ──────────────────────────────────────────────
  if (!apiKey) {
    console.log('\n┌──────────────────────────────────────────┐');
    console.log(`│  [OTP]  Phone : +91${digits.padEnd(20)}│`);
    console.log(`│         OTP   : ${otp.padEnd(26)}│`);
    console.log('│  (No FAST2SMS_API_KEY — console only)    │');
    console.log('└──────────────────────────────────────────┘\n');
    return { sent: false, dev: true };
  }

  // ── Fast2SMS OTP route ─────────────────────────────────────────────────────
  // Uses Fast2SMS pre-approved DLT OTP template:
  // "Your OTP for Farmgate Mandi is XXXXXX. Valid for 5 minutes."
  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('authorization', apiKey);
  url.searchParams.set('route', 'otp');
  url.searchParams.set('variables_values', otp);
  url.searchParams.set('flash', '0');
  url.searchParams.set('numbers', digits);

  let json;
  try {
    const res = await fetch(url.toString());
    json = await res.json().catch(() => ({}));
    if (!res.ok || json.return === false) {
      const msg = Array.isArray(json.message) ? json.message[0] : (json.message || 'SMS failed');
      throw new Error(msg);
    }
  } catch (err) {
    // Log error but don't crash — OTP is still stored, user can retry
    console.error('[SMS] Fast2SMS error:', err.message);
    throw err;
  }

  console.log(`[SMS] OTP sent to +91${digits} via Fast2SMS`);
  return { sent: true };
}
