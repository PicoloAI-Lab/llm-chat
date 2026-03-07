"use client";

import { useState, useTransition } from "react";
import type { Persona } from "@/lib/personas";
import { savePrompt, resetPrompt } from "@/app/actions/prompts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Save, RotateCcw } from "lucide-react";

interface PromptsEditorProps {
  personas: Persona[];
  initialPrompts: Record<string, string>;
}

type ActionState = "idle" | "saving" | "resetting" | "saved" | "saved-no-meta" | "error";

export function PromptsEditor({ personas, initialPrompts }: PromptsEditorProps) {
  const [prompts, setPrompts] = useState<Record<string, string>>(initialPrompts);
  const [states, setStates] = useState<Record<string, ActionState>>({});
  const [isPending, startTransition] = useTransition();

  const setStateFor = (id: string, state: ActionState) =>
    setStates((s) => ({ ...s, [id]: state }));

  const scheduleReset = (id: string) =>
    setTimeout(() => setStateFor(id, "idle"), 3000);

  const handleSave = (personaId: string) => {
    setStateFor(personaId, "saving");

    startTransition(async () => {
      const result = await savePrompt(personaId, prompts[personaId]);

      if (!result.success) {
        setStateFor(personaId, "error");
        return;
      }

      setStateFor(personaId, result.metadataUpdated ? "saved" : "saved-no-meta");
      scheduleReset(personaId);
    });
  };

  const handleReset = (personaId: string) => {
    setStateFor(personaId, "resetting");

    startTransition(async () => {
      const result = await resetPrompt(personaId);

      if (!result.success || !result.content) {
        setStateFor(personaId, "error");
        return;
      }

      setPrompts((p) => ({ ...p, [personaId]: result.content! }));
      setStateFor(personaId, result.metadataUpdated ? "saved" : "saved-no-meta");
      scheduleReset(personaId);
    });
  };

  return (
    <Tabs defaultValue={personas[0]?.id} className="flex flex-col gap-4">
      <TabsList className="w-fit">
        {personas.map((p) => (
          <TabsTrigger key={p.id} value={p.id} className="gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: p.accentColor }}
            />
            {p.name.split(" ")[0]}
          </TabsTrigger>
        ))}
      </TabsList>

      {personas.map((persona) => {
        const state = states[persona.id] ?? "idle";
        const busy = state === "saving" || state === "resetting";
        const charCount = (prompts[persona.id] ?? "").length;

        return (
          <TabsContent key={persona.id} value={persona.id} className="mt-0">
            <div className="flex flex-col gap-3">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ backgroundColor: persona.accentColor }}
                  >
                    {persona.initials}
                  </div>
                  <div>
                    <span className="font-medium text-sm">{persona.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {" "}· {persona.age} · {persona.location}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      color: persona.accentColor,
                      borderColor: persona.accentColor,
                    }}
                  >
                    {persona.issue}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {charCount.toLocaleString()} chars
                  </span>

                  {/* Status message */}
                  {(state === "saving" || state === "resetting") && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      {state === "resetting" ? "Resetting" : "Saving"} &amp; regenerating card…
                    </span>
                  )}
                  {state === "saved" && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Saved · card updated
                    </span>
                  )}
                  {state === "saved-no-meta" && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Saved · card not updated
                    </span>
                  )}
                  {state === "error" && (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Failed
                    </span>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReset(persona.id)}
                    disabled={busy || isPending}
                    className="gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleSave(persona.id)}
                    disabled={busy || isPending}
                    className="gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Prompt textarea */}
              <textarea
                value={prompts[persona.id] ?? ""}
                onChange={(e) =>
                  setPrompts((p) => ({ ...p, [persona.id]: e.target.value }))
                }
                className="w-full min-h-[520px] resize-y rounded-md border border-input bg-muted/30 px-4 py-3 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                spellCheck={false}
              />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
