import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import otpRoutes from './otpRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

const app = express();

app.use(express.json());
app.use('/api', otpRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Serve React frontend static files
app.use(express.static(distPath));

// Catch-all: return index.html for client-side routing (React Router)
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

export default app;
