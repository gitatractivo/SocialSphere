import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        // userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10,  cursor }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      const data = await ctx.prisma.post.findMany({
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true } },
          user: {
            select: { name: true, id: true, image: true },
          },
          //update this 
          likes: currentUserId==null?false:{where:{
            userId: currentUserId
          }}
        },
      });
      let nextCursor: typeof cursor| undefined 
      if(data.length>limit){
        const nextItem  = data.pop()
        if(nextItem){
          nextCursor = {id:nextItem.id, createdAt:nextItem.createdAt};
        }
        
      }
      return {posts:data.map(post=>{
        return{
          id:post.id,
          content:post.content,
          createdAt: post.createdAt,
          user: post.user,
          likeCount:post._count.likes,
          commentCount: post._count.comments,
          likedByMe: post.likes?.length>0,

        }
      }),nextCursor}
    }),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: { content, userId: ctx.session.user.id },
      });
      return post;
    }),
});
