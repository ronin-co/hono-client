import { afterAll, afterEach, beforeAll } from 'bun:test';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import.meta.env.RONIN_TOKEN = 'secret-token';

const mockHttpServer = setupServer(
  http.post('https://data.ronin.co/', async ({ request }) => {
    const queries = (await request.json()) as {
      queries: Array<{
        get: {
          users: {
            limitedTo?: number;
          };
        };
      }>;
    };

    const numRecords = queries?.queries?.[0].get?.users?.limitedTo || 0;
    const records = Array.from({ length: numRecords }).fill(null);

    return HttpResponse.json({
      results: [{ records }],
    });
  }),
);

beforeAll(() => mockHttpServer.listen());
afterEach(() => mockHttpServer.resetHandlers());
afterAll(() => mockHttpServer.close());
