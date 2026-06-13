import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { chatRouter } from "./chat-router";
import { newsRouter } from "./news-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  chat: chatRouter,
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
