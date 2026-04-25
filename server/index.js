import './env.js';
import express from 'express';
import otpRoutes from './otpRoutes.js';
import { getSupabaseAdminConfig } from './supabaseAdmin.js';

const PORT = Number(process.env['OTP_SERVER_PORT'] || 3001);

const app = express();

// ─── CORS: allow Vite dev server on any local or LAN origin ──────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  // Allow if: no origin (same-origin / curl), localhost, 127.0.0.1, or LAN IPs
  const isAllowed =
    !origin ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
    /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(express.json());
app.use('/api', otpRoutes);

// ─── 404 for unexpected routes ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: `No route: ${req.method} ${req.path}` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[OTP server] Unhandled error:', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message || 'Unexpected error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  const config = getSupabaseAdminConfig();
  const supabaseOk = !!(config.url && config.serviceRoleKey);

  console.log(`\n🚀 [OTP server] Listening on http://0.0.0.0:${PORT}`);
  console.log(`   Supabase: ${supabaseOk ? '✅ configured' : '❌ MISSING keys — profile upsert will fail'}`);
  console.log(`\n   POST /api/send-otp    { phone }`);
  console.log(`   POST /api/verify-otp  { phone, otp }`);
  console.log(`   POST /api/signup      { phone, otp, password, name }`);
  console.log(`   POST /api/login       { phone, password }\n`);
});
