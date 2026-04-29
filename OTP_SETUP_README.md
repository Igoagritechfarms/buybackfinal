# OTP System Setup & Troubleshooting Guide

## Overview
The OTP system uses:
- **Express server** (port 3001) for OTP generation and validation
- **Supabase** for OTP storage and user management
- **Vite dev server** (port 5173) proxying `/api/*` requests to the Express server

## Setup Steps

### 1. Create the Supabase table
Run the SQL in your Supabase SQL Editor:

```sql
-- See scripts/sql/create_phone_otps_table.sql
```

Or manually run the SQL file:
```bash
# Copy the SQL content from scripts/sql/create_phone_otps_table.sql
```

### 2. Configure environment variables
Ensure your `.env` file contains:

```bash
# Supabase (frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase (backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OTP security
OTP_JWT_SECRET=change-me-to-a-random-32-character-string

# Express server
OTP_SERVER_PORT=3001
```

### 3. Start both servers

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

### Test the Express server directly:
```bash
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Expected response:
# {"success":true,"message":"OTP generated...","otp":"123456","devMode":true}
```

### Test through the Vite proxy:
```bash
curl -X POST http://localhost:5173/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

## Common Issues & Fixes

### 1. 500 error on `/api/send-otp`
**Symptoms:**
- Browser console: `POST http://localhost:5173/api/send-otp 500`
- Frontend error: "Request failed (500)"

**Possible causes & solutions:**

#### A. Express server is not running
```bash
# Check if server is running
curl http://localhost:3001/api/send-otp

# If connection is refused, start the server:
npm run server:otp
```

#### B. Supabase table is missing
- Run the SQL migration from `scripts/sql/create_phone_otps_table.sql`
- Check server logs for: `[OTP] Falling back to in-memory store`

#### C. Supabase credentials are missing or invalid
```bash
# Check server startup logs:
cat server-start.log

# Should show:
# ✅ Supabase: configured

# If it shows ❌, check your .env file
```

#### D. RLS policies are blocking inserts
- The table uses the service role key, which bypasses RLS
- Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env` is correct

### 2. OTP is not showing on screen
In development mode (when Twilio is not configured), the OTP should:
1. Print to the server console
2. Return in the API response as `{"otp": "123456"}`
3. Auto-fill in the UI or display as a toast notification

Check:
- Server logs show the OTP
- Response includes `"devMode": true` and `"otp": "123456"`
- Frontend extracts and displays it

### 3. Phone number format issues
Valid formats:
- `9876543210` (10 digits)
- `919876543210` (12 digits with country code)
- `+919876543210` (E.164 format)

The system normalizes all values to `+919876543210` internally.

### 4. Vite proxy is not working
If Vite cannot reach the Express server:

1. Check Vite proxy settings:
```js
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

2. Verify the port in `.env`:
```bash
OTP_SERVER_PORT=3001
```

3. Check whether firewall or antivirus software is blocking localhost connections

## Development Workflow

1. **Start the Express server first**
   ```bash
   npm run server:otp
   ```

2. **Then start Vite**
   ```bash
   npm run dev
   ```

3. **Verify both servers are running**
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
1. Set all required environment variables in your hosting platform
2. Consider using Twilio for real SMS delivery:
   ```bash
   TWILIO_ACCOUNT_SID=your-sid
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Deploy the Express server separately or use serverless functions

### Security
- Never commit `.env` to git
- Use a strong `OTP_JWT_SECRET` (32+ random characters)
- Set `NODE_ENV=production` in production to hide detailed errors
- Enable HTTPS for all production traffic
- Consider rate limiting OTP endpoints

## Need Help?

1. Check server logs: `cat server-start.log`
2. Check the browser console (F12)
3. Test the API directly with curl
4. Verify environment variables are loaded
5. Ensure the Supabase table exists with the correct schema
