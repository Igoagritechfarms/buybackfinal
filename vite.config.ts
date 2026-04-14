import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  buildOtpMessage,
  createOrResendOtpSession,
  getOtpPolicy,
  invalidateOtpSession,
  sendSmsOtpMessage,
  verifyOtpSession,
} from './server/otpService.js';

function sendJson(res: ServerResponse, status: number, payload: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function devSmsOtpPlugin(env: Record<string, string>, mode: string): Plugin {
  return {
    name: 'dev-sms-otp-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0];
        if (pathname !== '/api/send-sms-otp' && pathname !== '/api/verify-otp') {
          next();
          return;
        }

        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }

        try {
          const body = await parseJsonBody(req);

          if (pathname === '/api/send-sms-otp') {
            const testModeFlag =
              env.OTP_TEST_MODE ||
              env.VITE_OTP_TEST_MODE ||
              process.env.OTP_TEST_MODE ||
              process.env.VITE_OTP_TEST_MODE ||
              'false';
            const testMode = String(testModeFlag).toLowerCase() === 'true';
            const testPhone = String(env.OTP_TEST_PHONE || process.env.OTP_TEST_PHONE || '1234567890').trim();
            const testOtp = String(env.OTP_TEST_OTP || process.env.OTP_TEST_OTP || '123456').trim();
            const accountSid = env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
            const authToken = env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
            const smsFrom = env.TWILIO_SMS_FROM || process.env.TWILIO_SMS_FROM;
            const smsTemplate = env.SMS_OTP_TEMPLATE || process.env.SMS_OTP_TEMPLATE || '';

            const countryCode =
              typeof body.countryCode === 'string' ? body.countryCode.trim() : '+91';
            const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
            const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : 'user';
            const localPhone = phone.replace(/\D/g, '');
            const useTestBypass = mode === 'development' && testMode;
            const shouldUseFixedTestOtp = useTestBypass && localPhone === testPhone;

            const created = createOrResendOtpSession({
              countryCode,
              phone,
              role,
              // In test mode, bypass SMS provider for any valid number.
              // Keep fixed OTP only for OTP_TEST_PHONE; other numbers get a fresh OTP.
              allowTestNumber: useTestBypass,
              otpOverride: shouldUseFixedTestOtp ? testOtp : undefined,
            });
            if (!created.ok) {
              sendJson(res, created.status, {
                error: created.error,
                retryAfterSeconds: created.retryAfterSeconds,
              });
              return;
            }

            if (useTestBypass) {
              console.log(
                `[OTP_TEST_MODE] SMS bypass for ${created.e164Phone}, OTP=${created.otp}, session=${created.sessionId}`
              );
            } else {
              if (!accountSid || !authToken || !smsFrom) {
                invalidateOtpSession(created.sessionId);
                sendJson(res, 500, {
                  error:
                    'SMS OTP service is not configured. Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_SMS_FROM.',
                });
                return;
              }

              const sent = await sendSmsOtpMessage({
                accountSid,
                authToken,
                smsFrom,
                toPhoneE164: created.e164Phone,
                body: buildOtpMessage(smsTemplate, created.otp, role),
              });

              if (!sent.ok) {
                invalidateOtpSession(created.sessionId);
                sendJson(res, sent.status, { error: sent.error });
                return;
              }
            }

            const policy = getOtpPolicy();
            sendJson(res, 200, {
              success: true,
              message: 'OTP sent successfully.',
              sessionId: created.sessionId,
              resendAfterSeconds: policy.resendAfterSeconds,
              expiresInSeconds: policy.expirySeconds,
              ...(useTestBypass && { testMode: true }),
            });
            return;
          }

          const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
          const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
          const verification = verifyOtpSession({ sessionId, otp });

          if (!verification.ok) {
            sendJson(res, verification.status, {
              error: verification.error,
              attemptsRemaining: verification.attemptsRemaining,
            });
            return;
          }

          sendJson(res, 200, {
            success: true,
            message: 'OTP verified successfully.',
            phone: verification.e164Phone,
            role: verification.role,
            verifiedAt: verification.verifiedAt,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unexpected server error';
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), devSmsOtpPlugin(env, mode)],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    css: {
      devSourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      host: '0.0.0.0',
      strictPort: false,
      allowedHosts: ['purple-geckos-crash.loca.lt', 'localhost', '127.0.0.1'],
    },
  };
});
