# OTP System Setup & Troubleshooting Guide

## Overview
The OTP system uses:
- **Express server** (port 3001) for OTP generation and validation
- **Supabase** for OTP storage and user management
- **Vite dev server** (port 5173) proxies `/api/*` requests to the Express server

## Setup Steps

### 1. Create Supabase Table
Run this SQL in your Supabase SQL Editor:

```sql
-- See scripts/sql/create_phone_otps_table.sql
```

Or manually run:
```bash
# Copy the SQL content from scripts/sql/create_phone_otps_table.sql
```

### 2. Configure Environment Variables
Ensure your `.env` file has:

```bash
# Supabase (Frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase (Backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OTP Security
OTP_JWT_SECRET=change-me-to-random-32char-string

# Express Server
OTP_SERVER_PORT=3001
```

### 3. Start Both Servers

**Option A: Start individually**
```bash
# Terminal 1: Start OTP server
npm run server:otp

# Terminal 2: Start Vite dev server
npm run dev
```

**Option B: Start together**
```bash
npm run dev:all
```

## Testing

### Test Express server directly:
```bash
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Expected response:
# {"success":true,"message":"OTP generated...","otp":"123456","devMode":true}
```

### Test through Vite proxy:
```bash
curl -X POST http://localhost:5173/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

## Common Issues & Fixes

### 1. 500 Error on `/api/send-otp`
**Symptoms:**
- Browser console: `POST http://localhost:5173/api/send-otp 500`
- Frontend error: "Request failed (500)"

**Possible Causes & Solutions:**

#### A. Express server not running
```bash
# Check if server is running
curl http://localhost:3001/api/send-otp

# If connection refused, start server:
npm run server:otp
```

#### B. Supabase table missing
- Run the SQL migration from `scripts/sql/create_phone_otps_table.sql`
- Check server logs for: `[OTP] Falling back to in-memory store`

#### C. Supabase credentials missing/invalid
```bash
# Check server startup logs:
cat server-start.log

# Should show:
# ✅ Supabase: configured

# If shows ❌, check your .env file
```

#### D. RLS policies blocking insert
- The table uses service role key which bypasses RLS
- Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env` is correct

### 2. OTP Not Showing on Screen
**In development mode** (no Twilio configured), the OTP should:
1. Print to server console
2. Return in API response as `{"otp": "123456"}`
3. Auto-fill in the UI or show as a toast notification

Check:
- Server logs show the OTP
- Response includes `"devMode": true` and `"otp": "123456"`
- Frontend extracts and displays it

### 3. Phone Number Format Issues
Valid formats:
- `9876543210` (10 digits)
- `919876543210` (12 digits with country code)
- `+919876543210` (E.164 format)

The system normalizes all to `+919876543210` internally.

### 4. Vite Proxy Not Working
If Vite can't reach the Express server:

1. Check Vite config proxy settings:
```js
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

2. Verify port in `.env`:
```bash
OTP_SERVER_PORT=3001
```

3. Check firewall/antivirus blocking localhost connections

## Development Workflow

1. **Always start the Express server first**
   ```bash
   npm run server:otp
   ```

2. **Then start Vite**
   ```bash
   npm run dev
   ```

3. **Check both servers are running**
   - Express: http://localhost:3001
   - Vite: http://localhost:5173 (or your configured port)

4. **Watch server logs** for OTP codes and errors
   ```bash
   # In the terminal running npm run server:otp
   # You'll see:
   # [OTP] ─────────────────────
   # [OTP]  Phone   : +919876543210
   # [OTP]  Code    : 123456
   # [OTP]  Expires : 12:45:30 PM
   # [OTP] ─────────────────────
   ```

## Deployment Notes

### Production (Vercel/Netlify/etc.)
1. Set all environment variables in your hosting platform
2. Consider using Twilio for real SMS:
   ```bash
   TWILIO_ACCOUNT_SID=your-sid
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Deploy Express server separately or use serverless functions

### Security
- Never commit `.env` to git
- Use strong `OTP_JWT_SECRET` (32+ random characters)
- In production, set `NODE_ENV=production` to hide detailed errors
- Enable HTTPS for all production traffic
- Consider rate limiting on OTP endpoints

## Need Help?

1. Check server logs: `cat server-start.log`
2. Check browser console (F12)
3. Test API directly with curl
4. Verify environment variables are loaded
5. Ensure Supabase table exists with correct schema
