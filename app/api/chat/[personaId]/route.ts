import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { PERSONAS_MAP } from "@/lib/personas";
import { getPrompt } from "@/lib/db";

export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ personaId: string }> }
) {
  const { personaId } = await params;
  const persona = PERSONAS_MAP[personaId];

  if (!persona) {
    return new Response(JSON.stringify({ error: "Persona not found" }), {
      status: 404,
    });
  }

  const { messages } = await req.json();

  // Read from DB, fall back to hardcoded default if DB unavailable
  const systemPrompt =
    (await getPrompt(personaId).catch(() => null)) ?? persona.systemPrompt;

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages,
    maxTokens: 300,
    temperature: 0.85,
  });

  return result.toDataStreamResponse();
}
