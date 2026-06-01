import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import pinoHttp from 'pino-http';
// CRITICAL: .js extension suffix mapping is required by your nodenext compiler config!
import { prisma } from './config/db.js';



const app = express();


// Initialize Structured Logging System
app.use(pinoHttp({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined
}));
// 2. Core Middleware (Required to read incoming data payloads)
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Mount test route to verify database connection
app.get('/api/health', async (req, res, next) => {
  try {
    // Basic connectivity check against your perfect schema model
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

// 4. Centralized Error-Handling Pipeline
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  req.log.error(err);
  res.status(500).json({ error: 'Internal Server Exception' });
});


export default app;