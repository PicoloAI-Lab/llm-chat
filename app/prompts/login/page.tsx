import { login } from "@/app/actions/prompts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Prompt Editor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the access password to continue.
          </p>
        </CardHeader>
        <CardContent>
          <form action={login} className="flex flex-col gap-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoFocus
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {error && (
              <p className="text-xs text-destructive">Incorrect password.</p>
            )}
            <Button type="submit" size="sm" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
