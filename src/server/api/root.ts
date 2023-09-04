import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { profileRouter } from './routers/profile'; 
import { messageRouter } from './routers/message'; 
import { chatRouter } from './routers/chat'; 

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  profile: profileRouter,
  message: messageRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
