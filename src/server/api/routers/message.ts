import { MessageFile } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";
import { pusherServer } from "~/utils/pusher";
import { FileInput } from "~/utils/types";

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
            include:{
              users: true,
            }
        })


        if (!chat) {
          throw new Error("Chat not found");
        }
        if (!chat.users.map((u) => u.userId).includes(currentUserId)) {
          throw new Error("You are not a member of this chat");
        }

        if(text ===undefined){
          text=""
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
            post:postId?{connect:{id: postId}}:undefined,
          },
          include:{
            files: true,
          }
        });
        // const messageWithRelations = await ctx.prisma.message.findUnique({
        //   where: { id: message.id },
        //   include: {
        //     user: true,
        //     post: true,
        //     files: true,
        //   },
        // });
        const pusherPayload: messagePayloadPusher = {
          message: message.text ,
          userId: message.userId,
          files: message.files ,
        };
        await pusherServer.trigger("chat-" + chatId, "new-message:", pusherPayload);
        return ;
    }),
});


type messagePayloadPusher = {
  message: string;
  userId: string;
  files: MessageFile[];
};