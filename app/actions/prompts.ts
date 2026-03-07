"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { PERSONAS, PERSONAS_MAP } from "@/lib/personas";
import {
  initDb,
  getAllPrompts,
  upsertPrompt,
  upsertMetadata,
  resetToDefault,
} from "@/lib/db";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  const expected = process.env.PROMPTS_PASSWORD ?? "admin";

  if (password === expected) {
    const cookieStore = await cookies();
    cookieStore.set("prompts_auth", password, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    redirect("/prompts");
  }

  redirect("/prompts/login?error=1");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("prompts_auth");
  redirect("/prompts/login");
}

export async function loadAllPrompts(): Promise<Record<string, string>> {
  await initDb();
  const fromDb = await getAllPrompts();

  const result: Record<string, string> = {};
  for (const persona of PERSONAS) {
    result[persona.id] = fromDb[persona.id] ?? persona.systemPrompt;
  }
  return result;
}

async function generateMetadata(
  content: string
): Promise<{ issue: string; description: string }> {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      issue: z
        .string()
        .describe(
          "A 3–6 word label for the caller's core problem. Use title case with ampersands, e.g. 'Job Loss & Family Breakdown'."
        ),
      description: z
        .string()
        .describe(
          "A 2–3 sentence, ~30 word third-person summary of who this person is and what they are going through. Factual and empathetic. No spoilers about the caller's plan."
        ),
    }),
    prompt: `You are summarising a persona for a suicide helpline training simulator.

Given the persona's system prompt below, generate:
1. A short issue tag (3–6 words, title case, e.g. "Debt, Heartbreak & Isolation")
2. A brief card description (~30 words, 2–3 sentences) describing who this person is and what brought them to call — written in third person, present tense, no dramatic spoilers.

System prompt:
${content}`,
  });

  return object;
}

export async function savePrompt(
  personaId: string,
  content: string
): Promise<{ success: boolean; error?: string; metadataUpdated: boolean }> {
  if (!PERSONAS_MAP[personaId]) {
    return { success: false, error: "Unknown persona", metadataUpdated: false };
  }

  try {
    await upsertPrompt(personaId, content);
  } catch (e) {
    return { success: false, error: String(e), metadataUpdated: false };
  }

  let metadataUpdated = false;
  try {
    const { issue, description } = await generateMetadata(content);
    await upsertMetadata(personaId, description, issue);
    metadataUpdated = true;
  } catch {
    // Non-fatal — prompt is saved, card will keep previous metadata
  }

  revalidatePath("/");
  return { success: true, metadataUpdated };
}

export async function resetPrompt(personaId: string): Promise<{
  success: boolean;
  error?: string;
  content: string | null;
  metadataUpdated: boolean;
}> {
  if (!PERSONAS_MAP[personaId]) {
    return { success: false, error: "Unknown persona", content: null, metadataUpdated: false };
  }

  let defaultContent: string | null = null;
  try {
    defaultContent = await resetToDefault(personaId);
  } catch (e) {
    return { success: false, error: String(e), content: null, metadataUpdated: false };
  }

  if (!defaultContent) {
    return { success: false, error: "No default found", content: null, metadataUpdated: false };
  }

  // Restore original hardcoded metadata — no generation needed on reset
  const persona = PERSONAS_MAP[personaId];
  await upsertMetadata(personaId, persona.description, persona.issue);

  revalidatePath("/");
  return { success: true, content: defaultContent, metadataUpdated: true };
}
