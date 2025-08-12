import { createHmac } from "crypto";

const SECRET = process.env.JWT_SECRET || "";
if (!SECRET) {
  console.warn("[JWT] Missing JWT_SECRET env var.");
}

type Payload = Record<string, any>;

const b64url = (i: Buffer | string) => Buffer.from(i).toString("base64url");
const b64urlJson = (o: any) => b64url(JSON.stringify(o));

export function signJwt(payload: Payload, expiresInSec = 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const full = { ...payload, iat: now, exp: now + expiresInSec };

  const unsigned = `${b64urlJson(header)}.${b64urlJson(full)}`;
  const sig = createHmac("sha256", SECRET).update(unsigned).digest("base64url");
  return `${unsigned}.${sig}`;
}

export function verifyJwt<T extends Payload = Payload>(token: string): T | null {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const unsigned = `${h}.${p}`;
    const expected = createHmac("sha256", SECRET).update(unsigned).digest("base64url");
    if (expected !== s) return null;

    const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as T;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === "number" && now >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

