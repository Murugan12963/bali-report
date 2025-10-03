import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import VKProvider from "next-auth/providers/vk";
import YandexProvider from "next-auth/providers/yandex";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DEFAULT_USER_PREFERENCES } from "@/types/user";

export const authOptions = {
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
      async authorize(credentials) {
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
    async session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch user preferences
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { preferences: true },
        });
        session.user.preferences =
          dbUser?.preferences || DEFAULT_USER_PREFERENCES;
      }
      return session;
    },
    async signIn({ user }: { user: any }) {
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
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
