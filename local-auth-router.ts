import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.APP_SECRET || "local-auth-secret-key-fallback"
);

async function generateLocalToken(
  userId: number,
  username: string
): Promise<string> {
  return new SignJWT({ localUserId: userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyLocalToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      clockTolerance: 60,
    });
    return payload as { localUserId: number; username: string };
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(50, "Username must be at most 50 characters")
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
          ),
        password: z.string().min(6, "Password must be at least 6 characters"),
        displayName: z
          .string()
          .min(1, "Display name is required")
          .max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      const result = await db.insert(localUsers).values({
        username: input.username,
        displayName: input.displayName,
        passwordHash,
      });

      const userId = Number(result[0].insertId);
      const token = await generateLocalToken(userId, input.username);

      return {
        token,
        user: {
          id: userId,
          username: input.username,
          displayName: input.displayName,
          name: input.displayName,
          role: "user" as const,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const users = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (users.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const user = users[0];
      const valid = await bcrypt.compare(input.password, user.passwordHash);

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = await generateLocalToken(user.id, user.username);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          name: user.displayName,
          role: user.role,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const req = ctx.req;
    const token = req.headers.get("x-local-auth-token");

    if (!token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No local auth token",
      });
    }

    const payload = await verifyLocalToken(token);
    if (!payload) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid token",
      });
    }

    const db = getDb();
    const users = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, payload.localUserId))
      .limit(1);

    if (users.length === 0) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const user = users[0];
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      name: user.displayName,
      role: user.role,
    };
  }),
});
