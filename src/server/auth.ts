import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import * as z from "zod";
import { NewSession } from "../utils/types";
import { DefaultJWT, JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
  }
  interface JWT {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string | null;
      username?: string | null;
    };
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string | null;
      username?: string | null;
    };
    id: string;
  }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 * 
 * 
 */

type SessionUpdate ={
  username?: string;
  image?: string;
}
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user, session, trigger }) => {
      // console.log(
      //   "jwt callback",
      //   "session",
      //   session,
      //   "token",
      //   token,
      //   "user",
      //   user
      // );
      if (user) {
        token.id = user.id;
        token.user = user ;
      }
      if (trigger === "update" && token.user !== undefined) {
        if (session?.username) {
          token = {
            ...token,
            user: {
              ...token.user,
              username: session?.username as string,
            },
          };
        }
        if (session?.image)
          token = {
            ...token,
            user: {
              ...token.user,
              image: session?.image as string,
            },
          };
      }

      return token;
    },
    session: ({ session, user, trigger, newSession, token }) => {
      // console.log(
      //   "session callback",
      //   "session",
      //   session,
      //   "token",
      //   token,
      //   "user",
      //   user
      // );

      // if(token){
      //   session.id = token.id;
      // }

      const data = {
        ...session,
        
      };
      if(!!token.user){
        data.user =  {
          id: token?.user.id as string,
          email: token?.user.email,
          username: token?.user.username as string,
          image: token?.user.image,
          name: token?.user.name,
        }
      }
      // console.log("session data",data)
      // console.log("\n\n after auth", session, "after auth");

      return data;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Username or Email",
          type: "text",
          placeholder: "Username or Email",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (
        credentials: Record<"email" | "password", string> | undefined,
        _request: unknown
      ) => {
        if (!credentials) {
          return null;
        }

        const creds = await loginSchema.parseAsync(credentials);

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: creds.email }, { username: creds.email }],
          },
        });

        if (!user) {
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const isValidPassword: boolean = await bcrypt.compare(
          creds.password,
          user.password as string
        );

        if (!isValidPassword) {
          return null;
        }
        console.log("authorised", user);

        return user;
      },
    }),
  ],
  session: {
    updateAge: 24 * 60 * 60,
    strategy: "jwt",
  },
  jwt: {
    secret: "super-secret",
    maxAge: 30 * 24 * 60 * 60,
    // 15 days
  },
  pages: {
    // signIn: "/",
    // newUser: "/sign-up",
  },
  debug: true,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(12),
});
