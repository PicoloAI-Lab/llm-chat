import { neon } from "@neondatabase/serverless";
import { PERSONAS } from "@/lib/personas";

function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export async function initDb() {
  const db = sql();

  await db`
    CREATE TABLE IF NOT EXISTS persona_prompts (
      persona_id      TEXT PRIMARY KEY,
      content         TEXT NOT NULL,
      default_content TEXT,
      description     TEXT,
      issue           TEXT,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Add columns for existing tables (safe no-ops if already present)
  await db`ALTER TABLE persona_prompts ADD COLUMN IF NOT EXISTS default_content TEXT`;
  await db`ALTER TABLE persona_prompts ADD COLUMN IF NOT EXISTS description TEXT`;
  await db`ALTER TABLE persona_prompts ADD COLUMN IF NOT EXISTS issue TEXT`;

  // Seed rows. On conflict:
  //   - default_content: set once, never overwritten (COALESCE keeps existing)
  //   - content: only set on first insert, never touched again
  //   - description/issue: filled in if null, otherwise left alone
  for (const persona of PERSONAS) {
    await db`
      INSERT INTO persona_prompts (persona_id, content, default_content, description, issue)
      VALUES (
        ${persona.id},
        ${persona.systemPrompt},
        ${persona.systemPrompt},
        ${persona.description},
        ${persona.issue}
      )
      ON CONFLICT (persona_id) DO UPDATE SET
        default_content = COALESCE(persona_prompts.default_content, EXCLUDED.default_content),
        description     = COALESCE(persona_prompts.description, EXCLUDED.description),
        issue           = COALESCE(persona_prompts.issue, EXCLUDED.issue)
    `;
  }
}

export async function getAllPrompts(): Promise<Record<string, string>> {
  const db = sql();
  const rows = await db`SELECT persona_id, content FROM persona_prompts`;
  return Object.fromEntries(
    rows.map((r) => [r.persona_id as string, r.content as string])
  );
}

export async function getPrompt(personaId: string): Promise<string | null> {
  const db = sql();
  const rows = await db`
    SELECT content FROM persona_prompts WHERE persona_id = ${personaId}
  `;
  return (rows[0]?.content as string) ?? null;
}

export async function getAllPersonaMetadata(): Promise<
  Record<string, { description: string; issue: string }>
> {
  const db = sql();
  const rows = await db`SELECT persona_id, description, issue FROM persona_prompts`;
  return Object.fromEntries(
    rows
      .filter((r) => r.description && r.issue)
      .map((r) => [
        r.persona_id as string,
        { description: r.description as string, issue: r.issue as string },
      ])
  );
}

export async function upsertPrompt(
  personaId: string,
  content: string
): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO persona_prompts (persona_id, content)
    VALUES (${personaId}, ${content})
    ON CONFLICT (persona_id)
    DO UPDATE SET content = ${content}, updated_at = NOW()
  `;
}

export async function upsertMetadata(
  personaId: string,
  description: string,
  issue: string
): Promise<void> {
  const db = sql();
  await db`
    UPDATE persona_prompts
    SET description = ${description}, issue = ${issue}, updated_at = NOW()
    WHERE persona_id = ${personaId}
  `;
}

/** Copies default_content back to content. Returns the default content. */
export async function resetToDefault(personaId: string): Promise<string | null> {
  const db = sql();
  const rows = await db`
    UPDATE persona_prompts
    SET content = default_content, updated_at = NOW()
    WHERE persona_id = ${personaId}
    RETURNING default_content
  `;
  return (rows[0]?.default_content as string) ?? null;
}
