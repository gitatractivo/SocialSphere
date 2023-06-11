import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";
import cloudinary from "~/server/cloudinary";
import formidable, { IncomingForm } from "formidable";
import { type UploadApiResponse } from "cloudinary";
// import IncomingForm from "formidable/Formidable";
// import tIncomingForm from 'formidable/Formidable';
// import IncomingForm from "formidable/Formidable";

interface CloudinaryImageResponse {
  public_id: string;
  version: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  original_filename: string;
}

export const postRouter = createTRPCRouter({
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, userId, cursor }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      return await getInfinitePosts({
        limit,
        ctx,
        cursor,
        whereClause: { userId },
      });
    }),
  infiniteFeed: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({ input: { limit = 10, onlyFollowing = false, cursor }, ctx }) => {
        const currentUserId = ctx.session?.user.id;

        return await getInfinitePosts({
          limit,
          ctx,
          cursor,
          whereClause:
            currentUserId == null || !onlyFollowing
              ? undefined
              : {
                  user: {
                    followers: {
                      some: {
                        id: currentUserId,
                      },
                    },
                  },
                },
        });
      }
    ),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().optional(),
        files: z
          .object({
            access_mode: z.string().optional(),
            asset_id: z.string(),
            bytes: z.number(),
            format: z.string(),
            url: z.string(),
            resource_type: z.string(),
            width: z.number(),
            height: z.number(),
            version: z.number(),
            public_id: z.string(),
          })
          .array(),
        isRepost:z.boolean().default(false),
        isComment: z.boolean().default(false),
        OriginalPostId:z.string().optional(),
      })
    )
    .mutation(async ({ input: { content="", files,isComment,isRepost,OriginalPostId }, ctx }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // const filesjson:string[] = JSON.parse(files as string)
      //cloudinary
      console.log(files, "files");
      console.log("first");

      
      if(isComment){

        const post = await ctx.prisma.post.create({
          data: {
            content,
            userId: ctx.session.user.id,
            commentToId:OriginalPostId,          
            file: {
              create: files.map((file) => {
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
          },
          include: {
            file: true,
          },
        });
        console.log(post);
        return {post}
      }




      const post = await ctx.prisma.post.create({
        data: {
          content,
          userId: ctx.session.user.id,
          file: {
            create: files.map((file) => {
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
        },
        include:{
          file:true,
        }
      });
      console.log(post)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { post };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { postId: id, userId: ctx.session.user.id };
      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_postId: data },
      });
      if (existingLike == null) {
        await ctx.prisma.like.create({
          data,
        });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({
          where: { userId_postId: data },
        });
        return { addedLike: false };
      }
    }),
  getDetails: protectedProcedure.query(() => {
    console.log("first");

    const apiSecret = cloudinary.config().api_secret as string;
    const apiKey = cloudinary.config().api_key as string;
    const cloudName = cloudinary.config().cloud_name as string;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        source: "uw",
        folder: "signed_upload_demo_uw",
      },
      apiSecret
    );

    return { apiSecret, apiKey, cloudName, signature };
  }),
});

async function getInfinitePosts({
  limit,
  ctx,
  cursor,
  whereClause,
}: {
  whereClause?: Prisma.PostWhereInput;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
}) {
  const currentUserId = ctx.session?.user.id;

  const data = await ctx.prisma.post.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } },
      user: {
        select: { name: true, id: true, image: true },
      },
      file:{
        select:{url:true,id:true,size:true,height:true,width:true,name:true}
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
  });
  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    const nextItem = data.pop();
    if (nextItem) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }
  return {
    posts: data.map((post) => {
      return {
        id: post.id,
        content: post.content,
        files: post.file,
        createdAt: post.createdAt,
        user: post.user,
        likeCount: post._count.likes,
        // commentCount: post._count.comments,
        likedByMe: post.likes?.length > 0,
      };
    }),
    nextCursor,
  };
}
