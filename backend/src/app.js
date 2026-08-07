import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import revenueRoutes from './routes/revenue.routes.js';
import { errorHandler, notFound } from './middleware/error-handler.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Revenue service is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/revenue', revenueRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
