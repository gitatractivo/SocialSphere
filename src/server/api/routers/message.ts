import { MessageFile, Prisma, User } from '@prisma/client';
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";
import { pusherServer } from "~/utils/pusher";
import { FileInput } from "~/utils/types";
import { Post,File } from "~/components/post/Posts";

export const messageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          chatId: z.string(),
          text: z.string(),
          files: FileInput.array(),
          postId: z.string(),
        })
        .partial({
          text: true,
          files: true,
          postId: true,
        })
        .refine(
          ({ text, postId, files }) =>
            text || postId || (files && files.length > 0),
          { message: "Post, Message, or Images are required" }
        )
    )
    .mutation(async ({ input: { chatId, files, text, postId }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      const chat = await ctx.prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          users: true,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }
      if (!chat.users.map((u) => u.userId).includes(currentUserId)) {
        throw new Error("You are not a member of this chat");
      }

      if (text === undefined) {
        text = "";
      }
      const message = await ctx.prisma.message.create({
        data: {
          text,
          user: { connect: { id: currentUserId } },
          chat: { connect: { id: chatId } },
          files: {
            create: files?.map((file) => {
              return {
                url: file.url,
                type: file.resource_type,
                name: file.public_id,
                extension: file.format,
                mime: file.public_id,
                size: file.bytes,
                height: file.height,
                width: file.width,
              };
            }),
          },
          post: postId ? { connect: { id: postId } } : undefined,
        },
        include: {
          files: true,
        },
      });

      const friendHasSeen = await ctx.prisma.usersOnChats.updateMany({
        where: {
          chatId,
          NOT: {
            userId: currentUserId,
          },
        },
        data: {
          hasSeen: {
            increment:1,
            //            setNull:true //TODO uncomment when we have seen feature
          },
        },
      });
      
      const pusherPayload: messagePayloadPusher = {
        message: message.text,
        userId: message.userId,
        files: message.files,
      };
      await pusherServer.trigger(
        "chat-" + chatId,
        "new-message:",
        pusherPayload
      );
      return;
    }),

  getChatMessages: protectedProcedure.input(
    z.object({
      chatId: z.string(),
      limit: z.number().optional(),
      cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
    })
  ).query(async({input:{chatId,limit=10,cursor},ctx})=>{
    const currentUserId = ctx.session?.user.id;

    const chat = await ctx.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: true,
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }
    if (!chat.users.map((u) => u.userId).includes(currentUserId)) {
      throw new Error("You are not a member of this chat");
    }

    const messages = await ctx.prisma.message.findMany({
      where: {
        chatId,
        createdAt: cursor ? { lt: cursor.createdAt } : undefined,
      },
      take: limit + 1,
      cursor: cursor ? { createdAt_id: cursor } : undefined,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        text: true,
        createdAt: true,
        userId: true,
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            _count: { select: { likes: true, comments: true, reposts: true } },
            user: {
              select: { name: true, id: true, image: true },
            },
            files: {
              select: {
                url: true,
                id: true,
                size: true,
                height: true,
                width: true,
                name: true,
              },
            },
            //update this
            likes:
              currentUserId == null
                ? false
                : {
                    where: {
                      userId: currentUserId,
                    },
                  },
          },
        },
        files: {
          select: {
            url: true,
            id: true,
            size: true,
            height: true,
            width: true,
            name: true,
          },
        },
      },
    });

    

    const hasSeenStatus = await ctx.prisma.usersOnChats.findFirst({
      where:{
        chatId,
        userId: currentUserId,
      },
      select:{
        hasSeen:true,
        id: true,
      }
      
    })

    if(!!hasSeenStatus&& hasSeenStatus.hasSeen!==0){
      await ctx.prisma.usersOnChats.updateMany({
        where:{
          id: hasSeenStatus.id,
        },
        data:{
          hasSeen:0
        }
      })

      //TODO: trigger that message has been seen
    }

    const friendHasSeen = await ctx.prisma.usersOnChats.findFirst({
      where: {
        chatId,
        NOT: {
          userId: currentUserId,
        },
      },
      select: {
        hasSeen: true,
        id: true,
      },
    });


    


    let nextCursor: typeof cursor | undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      if (nextItem) {
        nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
      }
    }

    return {
      messages: messages
        .map((message) => {
          return {
            id: message.id,
            text: message.text,
            createdAt: message.createdAt,
            user: message.userId,
            post: message?.post as Post | null,
            files: message?.files as File[] | null,
          };
        })
        .reverse(),
      nextCursor,
      hasSeen: hasSeenStatus?.hasSeen ??0,
      friendHasSeen: friendHasSeen?.hasSeen ?? 0,
    };
  }),
});


type messagePayloadPusher = {
  message: string;
  userId: string;
  files: MessageFile[];
};
