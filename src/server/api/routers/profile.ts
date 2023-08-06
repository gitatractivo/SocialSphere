import * as trpc from "@trpc/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from "~/server/api/trpc";
import { FileInput, createUsernameOrImageSchema, signUpSchema } from "~/utils/types";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const currentUserId = ctx.session?.user.id;
      const profile = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          name: true,
          image: true,
          _count: { select: { followers: true, following: true, posts: true } },
          followers:
            currentUserId == null
              ? undefined
              : { where: { id: currentUserId } },
        },
      });
      if (profile == null) return;
      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followingCount: profile._count.following,
        postsCount: profile._count.posts,
        isFollowing: profile.followers.length > 0,
      };
    }),
  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input: { userId }, ctx }) => {
      const currentUserId = ctx.session?.user.id;
      const existingFollow = await ctx.prisma.user.findFirst({
        where: { id: userId, followers: { some: { id: currentUserId } } },
      });
      let addedFollow;
      if (existingFollow == null) {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { connect: { id: currentUserId } } },
        });
        addedFollow = true;
      } else {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
        addedFollow = false;
      }
      return { addedFollow };
    }),
  createUser: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input: { email, password, username, name }, ctx }) => {
      console.log({ email, password, username, name });
      const exists = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (exists) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const result = await ctx.prisma.user.create({
        data: { username, email, password: hashedPassword, name },
      });

      return {
        status: 201,
        message: "Account created successfully",
        result: {
          id: result.id,
          username: result.username as string,
          email: result.email,
          name: result.name,
        },
      };
    }),
  chageOrCreateImage: protectedProcedure
    .input(
      z.object({
        image: FileInput,
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { image, userId } }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "User does not exists.",
        });
      }
      const result = await ctx.prisma.user.update({
        where: { id: userId },
        data: { image: image.url },
      });
      return {
        status: 201,
        message: "Image updated successfully",
      };
    }),
  chageOrCreateUserName: protectedProcedure
    .input(
      z.object({
        username: z.string().min(6),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { username, userId } }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "User does not exists.",
        });
      }
      const result = await ctx.prisma.user.update({
        where: { id: userId },
        data: { username },
      });
      return {
        status: 201,
        message: "Username updated successfully",
      };
    }),
  createUsernameOrImage: protectedProcedure
    .input(createUsernameOrImageSchema)
    .mutation(async ({ ctx, input: { image, userId, username } }) => {
      console.log(userId)
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      const userALl = await ctx.prisma.user.findMany({})
      console.log(user, userALl);
      if (!user) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "User does not exists.",
        });
      }
      const result = await ctx.prisma.user.update({
        where: { id: userId },
        data: { image: image?.url, username },
      });
      return {
        status: 201,
        message: "Image updated successfully",
        result:{
          image: result.image,
          username: result.username
        }
      };
    }),
  findUsernameExists: publicProcedure
    .input(
      z.object({
        username: z.string().optional(),
      })
    )
    .query(async ({ ctx, input: { username } }) => {
      if (!username || username.length < 6) {
        return {
          status: 201,
          message: "No input found",
          result: { usernameAvailable: null },
        };
      }
      const user = await ctx.prisma.user.findFirst({
        where: {
          username,
        },
      });

      return {
        status: 201,
        message: "UserName available",
        result: { usernameAvailable: !user },
      };
    }),
});
