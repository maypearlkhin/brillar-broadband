import type { JwtUser } from "@/lib/auth";

export function userGreetingLine(user: JwtUser): string {
  const n = user.name?.trim();

  if (n) {
    const first = n.split(/\s+/)[0];
    return `Hi, ${first}`;
  }

  const local = user.email?.split("@")[0];

  return local ? `Hi, ${local}` : "Hi";
}
