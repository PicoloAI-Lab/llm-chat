export const dynamic = "force-dynamic";

import { PERSONAS } from "@/lib/personas";
import { loadAllPrompts, logout } from "@/app/actions/prompts";
import { PromptsEditor } from "@/components/prompts-editor";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default async function PromptsPage() {
  const initialPrompts = await loadAllPrompts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-8 py-4 flex items-center gap-3">
        <span className="font-semibold text-sm tracking-tight">Picolo AI</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-muted-foreground">Prompt Editor</span>
        <div className="ml-auto">
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-10">
        <div className="mb-8 max-w-xl">
          <h1 className="text-xl font-semibold tracking-tight mb-2">
            Persona system prompts
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Edit each persona&apos;s system prompt below. Changes are saved to{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              prompts/
            </code>{" "}
            and take effect on the next chat message.
          </p>
        </div>

        <PromptsEditor personas={PERSONAS} initialPrompts={initialPrompts} />
      </main>
    </div>
  );
}
