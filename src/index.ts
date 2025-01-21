import { createMiddleware } from 'hono/factory';
import createFactory from 'ronin';

type Factory = ReturnType<typeof createFactory>;

export type Bindings = {
  RONIN_TOKEN: string;
};

export type Variables = {
  ronin: Factory;
};

type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

type QueryHandlerOptions = Parameters<typeof createFactory>[0];

/**
 * Create a Hono middleware that injects a RONIN client into the Hono context variables.
 *
 * @param options - An optional object that can be used to configure the RONIN client.
 *
 * @example .env
 * ```bash
 * RONIN_TOKEN=your-ronin-token
 * ```
 *
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { ronin, type Bindings, type Variables } from '@ronin/hono';
 *
 * const app = new Hono()
 * 	.use('*', ronin())
 * 	.get('/', async (c) => {
 * 		const posts = await c.var.ronin.get.posts();
 * 		return c.json(posts);
 * 	});
 * ```
 *
 * @returns A Hono middleware.
 */
export const ronin = (options: QueryHandlerOptions = {}) =>
  createMiddleware<Env>(async (c, next) => {
    if (!c.env.RONIN_TOKEN) {
      throw new Error(
        'A `RONIN_TOKEN` environment variable must be provided for the RONIN middleware',
      );
    }

    const { token: userToken, ...userOptions } =
      typeof options === 'function' ? options() : options;

    if (userToken) {
      throw new Error('The RONIN middleware does not support a `token` option');
    }

    const client = createFactory({
      token: c.env.RONIN_TOKEN,
      ...userOptions,
    });

    c.set('ronin', client);

    await next();
  });
