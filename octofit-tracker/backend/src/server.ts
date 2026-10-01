import { connectDatabase } from './config/database';
import { apiBaseUrl } from './config/api-url';
import app from './app';

const port = Number(process.env.PORT ?? 8000);

void connectDatabase();

app.listen(port, () => {
  console.log(`Octofit API listening at ${apiBaseUrl}`);
});