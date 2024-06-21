import { describe, expect, it } from "bun:test";
import { AsyncLocalStorage } from "node:async_hooks";
import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";

import { ronin } from "@/index";

import type { Bindings, Variables } from "@/index";

describe("use `ronin` middleware", () => {
  const factory = createFactory<{ Bindings: Bindings; Variables: Variables }>();

  it("with a missing `RONIN_TOKEN`", async () => {
    const app = factory
      .createApp()
      .use("*", ronin())
      .get("/", async (c) => {
        expect(c.var.ronin).toBeDefined();

        const posts = (await c.var.ronin.get.blogPosts()) as Array<unknown>;

        return c.json(posts);
      });

    const response = await testClient(app, {
      RONIN_TOKEN: null,
    }).index.$get();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it("with default options", async () => {
    const app = factory
      .createApp()
      .use("*", ronin())
      .get("/", async (c) => {
        expect(c.var.ronin).toBeDefined();

        const users = await c.var.ronin.get.users();

        expect(users).toBeDefined();
        expect(users).toBeInstanceOf(Array);

        return c.json(users);
      });

    const response = await testClient(app, {
      RONIN_TOKEN: import.meta.env.RONIN_TOKEN,
    }).index.$get();

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json).toBeDefined();
    expect(json).toBeInstanceOf(Array);
    expect(json).toHaveLength(0);
  });

  it("with a custom options", async () => {
    const app = factory
      .createApp()
      .use(
        "*",
        ronin({
          hooks: {
            user: {
              beforeGet: (query) => {
                query.limitedTo = 1;
                return query;
              },
            },
          },
          asyncContext: new AsyncLocalStorage(),
        }),
      )
      .get("/", async (c) => {
        expect(c.var.ronin).toBeDefined();

        const users = await c.var.ronin.get.users();

        expect(users).toBeDefined();
        expect(users).toBeInstanceOf(Array);

        return c.json(users);
      });

    const response = await testClient(app, {
      RONIN_TOKEN: import.meta.env.RONIN_TOKEN,
    }).index.$get();

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json).toBeDefined();
    expect(json).toBeInstanceOf(Array);
    expect(json).toHaveLength(1);
  });
});
