import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatMessages } from "@db/schema";
import { eq, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callAI(messages: Array<{ role: string; content: string }>) {
  const systemMessage = {
    role: "system",
    content:
      "You are LUMINA, an AI news intelligence assistant. You help users understand AI news, trends, and developments. Keep responses concise (2-4 sentences max), informative, and engaging. Use a confident, expert tone.",
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.KIMI_OPEN_URL || "https://lumina.ai",
      "X-Title": "LUMINA AI News",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "I apologize, I couldn't process that request.";
}

export const chatRouter = createRouter({
  send: publicQuery
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const sessionId = input.sessionId || uuidv4();

      // Store user message
      await db.insert(chatMessages).values({
        sessionId,
        role: "user",
        content: input.message,
      });

      // Get conversation history
      const history = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(asc(chatMessages.createdAt));

      // Format for AI
      const messages = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call AI
      const aiResponse = await callAI(messages);

      // Store AI response
      await db.insert(chatMessages).values({
        sessionId,
        role: "assistant",
        content: aiResponse,
      });

      return {
        response: aiResponse,
        sessionId,
      };
    }),

  history: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(asc(chatMessages.createdAt));

      return messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
    }),

  clear: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId));
      return { success: true };
    }),
});
