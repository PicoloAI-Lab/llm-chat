import { PERSONAS } from "@/lib/personas";
import { PersonaCard } from "@/components/persona-card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-8 py-4 flex items-center gap-3">
        <span className="font-semibold text-sm tracking-tight">Picolo AI</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-muted-foreground">
          Helpline Training Simulator
        </span>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-14">
        <div className="mb-12 max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight mb-3">
            Choose a caller to practice with
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each persona represents a real profile you may encounter on the
            helpline. You are the counsellor. Listen carefully — how you respond
            determines how much they open up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAS.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </main>

      <footer className="border-t px-8 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          This is a training tool. All personas are AI-generated simulations.
        </p>
      </footer>
    </div>
  );
}
