import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

interface HookPayload {
  user: { id: string; phone: string };
  sms:  { otp: string };
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: HookPayload;
  try {
    payload = await req.json() as HookPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const phone = payload?.user?.phone ?? '';
  const otp   = payload?.sms?.otp   ?? '';

  if (!phone || !otp) {
    return new Response(JSON.stringify({ error: 'Missing phone or otp' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract last 10 digits as the key
  const national = phone.replace(/\D/g, '').slice(-10);

  console.log(`[OTP] Phone: ${phone} | national: ${national} | OTP: ${otp}`);

  // Save OTP to phone_otps table so the app can display it
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (supabaseUrl && serviceKey && national.length === 10) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/phone_otps`, {
        method: 'POST',
        headers: {
          'apikey':        serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type':  'application/json',
          'Prefer':        'resolution=merge-duplicates',
        },
        body: JSON.stringify({ phone: national, otp }),
      });
      console.log(`[DB] OTP saved, status=${res.status}`);
    } catch (err) {
      console.error('[DB] Failed to save OTP:', err);
    }
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
