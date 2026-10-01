import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, mock, test } from 'node:test';
import app from '../src/app';
import {
  ActivityModel,
  LeaderboardModel,
  TeamModel,
  UserModel,
  WorkoutModel,
} from '../src/models';

const collections = [
  { path: 'users', model: UserModel },
  { path: 'teams', model: TeamModel },
  { path: 'activities', model: ActivityModel },
  { path: 'leaderboard', model: LeaderboardModel },
  { path: 'workouts', model: WorkoutModel },
];

let baseUrl: string;
let server: ReturnType<typeof app.listen>;

before(async () => {
  for (const collection of collections) {
    mock.method(collection.model, 'find', () => ({
      lean: async () => [{ collection: collection.path }],
    }));
    mock.method(collection.model, 'create', async (document) => ({
      _id: `created-${collection.path}`,
      ...document,
    }));
  }

  server = app.listen(0);
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  mock.restoreAll();
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('GET /api/health reports API status and connection information', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.ok(['connected', 'connecting'].includes(body.database));
  assert.equal(typeof body.apiBaseUrl, 'string');
});

test('API responses allow requests from the frontend origin', async () => {
  const frontendOrigin = process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-5173.app.github.dev`
    : 'http://localhost:5173';
  const response = await fetch(`${baseUrl}/api/users`, {
    headers: { origin: frontendOrigin },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin);
});

test('API preflight requests allow JSON POSTs from the frontend origin', async () => {
  const frontendOrigin = process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-5173.app.github.dev`
    : 'http://localhost:5173';
  const response = await fetch(`${baseUrl}/api/users`, {
    method: 'OPTIONS',
    headers: {
      origin: frontendOrigin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin);
});

test('GET collection routes return their records', async () => {
  for (const collection of collections) {
    const response = await fetch(`${baseUrl}/api/${collection.path}`);

    assert.equal(response.status, 200, collection.path);
    assert.deepEqual(await response.json(), [{ collection: collection.path }]);
  }
});

test('POST collection routes create and return a record', async () => {
  for (const collection of collections) {
    const document = { example: collection.path };
    const response = await fetch(`${baseUrl}/api/${collection.path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(document),
    });

    assert.equal(response.status, 201, collection.path);
    assert.deepEqual(await response.json(), {
      _id: `created-${collection.path}`,
      ...document,
    });
  }
});