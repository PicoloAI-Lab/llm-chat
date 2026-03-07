import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const auth = request.cookies.get("prompts_auth")?.value;
  const password = process.env.PROMPTS_PASSWORD ?? "admin";

  if (auth !== password) {
    return NextResponse.redirect(new URL("/prompts/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/prompts"],
};
