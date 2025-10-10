import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import VKProvider from "next-auth/providers/vk";
import YandexProvider from "next-auth/providers/yandex";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DEFAULT_USER_PREFERENCES, UserPreferences } from "@/types/user";

interface ExtendedSession extends Session {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    preferences?: UserPreferences;
  };
}

interface SignInCallbackParams {
  user: User;
  account: any;
  profile?: any;
  email?: { verificationRequest?: boolean };
  credentials?: Record<string, any>;
}

interface SessionCallbackParams {
  session: ExtendedSession;
  token: JWT;
  user: User;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    VKProvider({
      clientId: process.env.VK_CLIENT_ID || "",
      clientSecret: process.env.VK_CLIENT_SECRET || "",
    }),
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID || "",
      clientSecret: process.env.YANDEX_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { credentials: true },
        });

        if (!user?.credentials?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.credentials.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: any): Promise<ExtendedSession> {
      if (session.user && token.id) {
        session.user.id = token.id as string;

        // Fetch user preferences
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { preferences: true },
        });

        session.user.preferences =
          dbUser?.preferences ? {
            ...DEFAULT_USER_PREFERENCES,
            ...(dbUser.preferences as any),
            savedSearches: [] // Add missing field for compatibility
          } : DEFAULT_USER_PREFERENCES;
      }
      return session;
    },
    async signIn({ user }: SignInCallbackParams): Promise<boolean> {
      try {
        // Create default preferences for new users
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { preferences: true },
        });

        if (!existingUser?.preferences) {
          await prisma.userPreferences.create({
            data: {
              userId: user.id,
              ...DEFAULT_USER_PREFERENCES,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
