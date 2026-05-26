import express from 'express';
import otpRoutes from './otpRoutes.js';

const app = express();

app.use(express.json());
app.use('/api', otpRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

export default app;
