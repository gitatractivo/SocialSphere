import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  createOrGet: protectedProcedure
    .input(
      z.object({
        friend: z.string(),
      })
    )
    .mutation(async ({ input: { friend }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      //check if user exits
      const userFriend = await ctx.prisma.user.findUnique({
        where: { id: friend },
      });

      if (!userFriend) {
        throw new Error("User not found");
      }

      const existingChats = await ctx.prisma.chat.findMany({
        where: {
          users: {
            some: {
              userId: currentUserId,
            },
          },
        },
        include: {
          users: true,
        },
      });

      const existingChat = existingChats.find((chat) =>
        chat.users.some((user) => user.userId === friend)
      );

      //check if chat exists
      if (existingChat) {
        return {
          chat: existingChat,
        };
      }

      // create a chat
      const chat = ctx.prisma.chat.create({
        data: {
          users: {
            createMany: {
              data: [
                {
                  userId: currentUserId,
                },
                {
                  userId: friend,
                },
              ],
            },
          },
        },
        include:{
          users: true
        }
      });

      return {
        chat,
      };
    }),
  
});


