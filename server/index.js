import './env.js';
import app from './app.js';
import { getSupabaseAdminConfig } from './supabaseAdmin.js';

const PORT = Number(process.env['OTP_SERVER_PORT'] || 3001);

app.listen(PORT, '0.0.0.0', () => {
  const config = getSupabaseAdminConfig();
  const supabaseOk = !!(config.url && config.serviceRoleKey);

  console.log(`\n[OTP server] Listening on http://0.0.0.0:${PORT}`);
  console.log(`   Supabase: ${supabaseOk ? 'configured' : 'MISSING keys - profile upsert will fail'}`);
  console.log(`\n   POST /api/send-otp    { phone }`);
  console.log(`   POST /api/verify-otp  { phone, otp }`);
  console.log(`   POST /api/signup      { phone, otp, password, name, username }`);
  console.log(`   POST /api/login       { identifier, password }`);
  console.log(`   POST /api/login-otp   { phone, otp }\n`);
});
