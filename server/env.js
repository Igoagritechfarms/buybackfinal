import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __serverDir = dirname(fileURLToPath(import.meta.url));

// Load server/.env first (works whether launched from project root or server/)
config({ path: resolve(__serverDir, '.env') });
// Then fall back to CWD/.env (Vercel / production via env vars)
config();
