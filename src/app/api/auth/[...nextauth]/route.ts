import NextAuth from "next-auth";
import { authOptions } from "@/config/auth";

export const { GET, POST } = NextAuth(authOptions);
