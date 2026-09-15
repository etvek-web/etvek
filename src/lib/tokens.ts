import "server-only";
import { SignJWT, jwtVerify } from "jose";

function secret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) throw new Error("AUTH_SECRET no está definido o es demasiado corto.");
  return new TextEncoder().encode(raw);
}

/** Token de corta duración que habilita subir un comprobante para una admisión concreta. */
export async function signReceiptToken(admissionId: string) {
  return new SignJWT({ admissionId, scope: "receipt" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret());
}

export async function verifyReceiptToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.scope !== "receipt") return null;
    return String(payload.admissionId);
  } catch {
    return null;
  }
}
