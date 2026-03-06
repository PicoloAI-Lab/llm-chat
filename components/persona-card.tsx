"use client";

import Link from "next/link";
import type { Persona } from "@/lib/personas";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Link href={`/chat/${persona.id}`} className="group block">
      <Card className="h-full transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-md cursor-pointer">
        <CardContent className="pt-6 pb-4 flex flex-col gap-3">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ backgroundColor: persona.accentColor }}
            >
              {persona.initials}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-base leading-tight">
                  {persona.name}
                </span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {persona.age}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {persona.occupation}
              </span>
              <span className="text-xs text-muted-foreground">
                {persona.location}
              </span>
            </div>
          </div>

          <Badge
            variant="outline"
            className="w-fit text-xs font-medium"
            style={{
              color: persona.accentColor,
              borderColor: persona.accentColor,
            }}
          >
            {persona.issue}
          </Badge>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {persona.description}
          </p>
        </CardContent>

        <CardFooter className="pt-0 pb-4">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5 group-hover:text-foreground transition-colors">
            Begin session
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
