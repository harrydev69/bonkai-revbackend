import { verifyJwt } from "@/lib/jwt";

type JwtPayload = { sub?: string; id?: string; wallet?: string; iat?: number; exp?: number };

export function getUserFromRequest(req: Request): JwtPayload | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  let token = "";
  if (authHeader.toLowerCase().startsWith("bearer ")) token = authHeader.slice(7).trim();

  if (!token) {
    const cookie = req.headers.get("cookie") || "";
    const parts = cookie.split(";").map((c) => c.trim());
    const find = (name: string) => {
      const needle = name.toLowerCase() + "=";
      const hit = parts.find((p) => p.toLowerCase().startsWith(needle));
      return hit ? hit.substring(needle.length) : "";
    };
    token = find("bonkai_session") || find("token");
  }

  if (!token) return null;
  return verifyJwt<JwtPayload>(token);
}
