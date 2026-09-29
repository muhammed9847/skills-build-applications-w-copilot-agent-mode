import express from 'express';
import database from './config/database';

const app = express();

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: database.readyState === 1 ? 'connected' : 'connecting',
  });
});

const port = Number(process.env.PORT ?? 8000);

app.listen(port, () => {
  console.log(`Octofit API listening on port ${port}`);
});