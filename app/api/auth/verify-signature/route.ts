import { NextResponse } from "next/server"
import { createPublicKey, verify as verifySignature } from "crypto"
import { signJwt } from "@/lib/jwt"
import { getOrCreateUser } from "@/lib/database"

export const runtime = "nodejs"        // ensure Node crypto
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Base58 decode (Bitcoin alphabet)
function base58Decode(str: string): Buffer {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  let num = 0n
  for (const ch of str) {
    const idx = ALPHABET.indexOf(ch)
    if (idx === -1) throw new Error("Invalid base58 character")
    num = num * 58n + BigInt(idx)
  }
  const bytes: number[] = []
  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn))
    num >>= 8n
  }
  // leading zeros
  for (const ch of str) {
    if (ch === "1") bytes.unshift(0)
    else break
  }
  return Buffer.from(bytes)
}

// ed25519 verify using Node crypto
function verifyEd25519(wallet: string, message: string, signature: string): boolean {
  try {
    const publicKeyRaw = base58Decode(wallet)      // 32 bytes
    const signatureRaw = base58Decode(signature)  // 64 bytes
    // RFC 8410 SPKI prefix for Ed25519
    const prefix = Buffer.from("302a300506032b6570032100", "hex")
    const spki = Buffer.concat([prefix, publicKeyRaw])
    const keyObject = createPublicKey({ key: spki, format: "der", type: "spki" })
    const messageBytes = new TextEncoder().encode(message)
    return verifySignature(null, messageBytes, keyObject, signatureRaw)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { wallet, message, signature } = body || {}

    if (!wallet || !message || !signature) {
      return NextResponse.json({ error: "Missing wallet, message or signature" }, { status: 400 })
    }

    const valid = verifyEd25519(wallet, message, signature)
    if (!valid) {
      return NextResponse.json({ valid: false, error: "Invalid signature" }, { status: 401 })
    }

    // Create or fetch the user, then issue a session token (1h)
    const user = await getOrCreateUser(wallet)
    const token = signJwt({ id: user.id, wallet: user.walletAddress }, 60 * 60)

    const res = NextResponse.json({ valid: true, token, user }, { status: 200 })
    // HttpOnly cookie for session
    res.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; Max-Age=3600; SameSite=Lax`
    )
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to verify signature" }, { status: 500 })
  }
}
