import { Prisma } from "@prisma/client";
import { TRPCError, inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import { Post } from "~/components/post/Posts";
import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import cloudinary from "~/server/cloudinary";
import { FileInput } from "~/utils/types";
// import IncomingForm from "formidable/Formidable";
import * as trpc from '@trpc/server';
// import tIncomingForm from 'formidable/Formidable';
// import IncomingForm from "formidable/Formidable";

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
  infiniteComments: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { id, limit = 10, cursor }, ctx }) => {
      return await getInfinitePosts({
        limit,
        ctx,
        cursor,
        whereClause: { commentToId: id },
      });
    }),

  create: protectedProcedure
    .input(
      z
        .object({
          content: z.string(),
          files: FileInput.array(),
          isRepost: z.boolean().default(false),
          isComment: z.boolean().default(false),
          OriginalPostId: z.string(),
        })
        .partial({
          content: true,
          files: true,
          OriginalPostId: true,
        })
        .refine(
          ({ OriginalPostId, content, files }) =>
            OriginalPostId || content || (files && files.length > 0),
          { message: "Content, Original Post Id, or files are required" }
        )
    )
    .mutation(
      async ({
        input: { content, files, isComment, isRepost, OriginalPostId },
        ctx,
      }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // const filesjson:string[] = JSON.parse(files as string)
        //cloudinary

        let post = await ctx.prisma.post.create({
          data: {
            ...(content ? { content } : {}),
            userId: ctx.session.user.id,

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
          },
          select: selectObject(ctx.session.user.id),
        });

        if (isRepost) {
          post = await ctx.prisma.post.update({
            where: { id: post.id },
            data: {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              repostTo: { connect: { id: OriginalPostId! } },
            },

            select: selectObject(ctx.session.user.id)
          });
        }
        if (isComment) {
          post = await ctx.prisma.post.update({
            where: { id: post.id },
            data: {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              commentTO: { connect: { id: OriginalPostId! } },
            },
            select: selectObject(ctx.session.user.id),
          });
        }

        return {
          post: {
            ...post,
            content: post.content as string,
          },
        };
      }
    ),

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
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      const post = await ctx.prisma.post.findUnique({
        where: { id },
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true, reposts: true } },
          user: {
            select: { name: true, id: true, image: true, username: true },
          },
          files: true,
          commentToId: true,
          repostToId: true,
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
      if (post == null) return;
      return { ...post, isLiked: post.likes.length > 0 };
    }),
  getDetails: protectedProcedure.query(() => {

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

  if(!currentUserId){
    throw new trpc.TRPCError({
      code: "CONFLICT",
      message: "Error",
    });
  }

  const data = await ctx.prisma.post.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: selectObject(currentUserId),
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
        content: post.content as string,
        files: post.files,
        createdAt: post.createdAt,
        user: post.user,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        repostCount: post._count.reposts,
        likedByMe: post.likes?.length > 0,
        comments: post.comments.map((comment) => {
          return {
            id: comment.id,
            content: comment.content as string,
            files: comment.files,
            createdAt: comment.createdAt,
            user: comment.user,
            likeCount: comment._count.likes,
            commentCount: comment._count.comments,
            repostCount: comment._count.reposts,
            likedByMe: (comment.likes.length) > 0,
          };
        }),
        commentTO: {
          id: post?.commentTO?.id,
          content: post?.commentTO?.content as string,
          files: post?.commentTO?.files,
          createdAt: post?.commentTO?.createdAt,
          user: post?.commentTO?.user,
          likeCount: post?.commentTO?._count.likes,
          commentCount: post?.commentTO?._count.comments,
          repostCount: post?.commentTO?._count.reposts,
          likedByMe: (post?.commentTO?.likes.length as number) > 0,
        },
        reposts: post.reposts.map((comment) => {
          return {
            id: comment.id,
            content: comment.content as string,
            files: comment.files,
            createdAt: comment.createdAt,
            user: comment.user,
            likeCount: comment._count.likes,
            commentCount: comment._count.comments,
            repostCount: comment._count.reposts,
            likedByMe: (comment.likes.length) > 0,
          };
        }),
        repostTo: {
          id: post?.repostTo?.id,
          content: post?.repostTo?.content as string,
          files: post?.repostTo?.files,
          createdAt: post?.repostTo?.createdAt,
          user: post?.repostTo?.user,
          likeCount: post?.repostTo?._count.likes,
          commentCount: post?.repostTo?._count.comments,
          repostCount: post?.repostTo?._count.reposts,
          likedByMe: (post?.repostTo?.likes.length as number) > 0,
        },
      };
    }),
    nextCursor,
  };
}



const selectObject = (user:string)=>{
  return{
              id: true,
              content: true,
              createdAt: true,
              _count: {
                select: { likes: true, comments: true, reposts: true },
              },
              user: {
                select: { name: true, id: true, image: true, username: true },
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
                user == null
                  ? false
                  : {
                      where: {
                        userId: user,
                      },
                    },
              commentTO: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  _count: {
                    select: { likes: true, comments: true, reposts: true },
                  },
                  user: {
                    select: {
                      name: true,
                      id: true,
                      image: true,
                      username: true,
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
                  likes:
                    user == null
                      ? false
                      : {
                          where: {
                            userId: user,
                          },
                        },
                },
              },
              commentToId: true,
              comments: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  _count: {
                    select: { likes: true, comments: true, reposts: true },
                  },
                  user: {
                    select: {
                      name: true,
                      id: true,
                      image: true,
                      username: true,
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
                  likes:
                    user == null
                      ? false
                      : {
                          where: {
                            userId: user,
                          },
                        },

                  //update this
                },
              },
              repostTo: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  _count: {
                    select: { likes: true, comments: true, reposts: true },
                  },
                  user: {
                    select: {
                      name: true,
                      id: true,
                      image: true,
                      username: true,
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
                  likes:
                    user == null
                      ? false
                      : {
                          where: {
                            userId: user,
                          },
                        },
                },
              },
              repostToId: true,
              reposts: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  _count: {
                    select: { likes: true, comments: true, reposts: true },
                  },
                  user: {
                    select: {
                      name: true,
                      id: true,
                      image: true,
                      username: true,
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
                  likes:
                    user == null
                      ? false
                      : {
                          where: {
                            userId: user,
                          },
                        },

                  //update this
                },
              },
            }
}