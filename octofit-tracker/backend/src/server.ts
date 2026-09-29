import express from 'express';
import database from './config/database';
import { apiBaseUrl } from './config/api-url';
import apiRouter from './routes/api';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: database.readyState === 1 ? 'connected' : 'connecting',
    apiBaseUrl,
  });
});

const port = Number(process.env.PORT ?? 8000);

app.listen(port, () => {
  console.log(`Octofit API listening at ${apiBaseUrl}`);
});