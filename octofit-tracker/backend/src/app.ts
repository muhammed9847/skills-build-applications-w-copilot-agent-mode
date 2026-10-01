import express from 'express';
import cors from 'cors';
import database from './config/database';
import { apiBaseUrl } from './config/api-url';
import apiRouter from './routes/api';

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.CODESPACE_NAME
    ? [`https://${process.env.CODESPACE_NAME}-5173.app.github.dev`]
    : []),
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/api', apiRouter);

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: database.readyState === 1 ? 'connected' : 'connecting',
    apiBaseUrl,
  });
});

export default app;