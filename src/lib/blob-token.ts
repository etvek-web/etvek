/**
 * Resolución del token de Vercel Blob.
 *
 * Igual que con la conexión a Postgres, la integración no siempre usa el nombre
 * canónico: al vincular el store puede prefijar las variables con su nombre
 * (`ETVEK_READ_WRITE_TOKEN`). Una variable creada pero vacía cuenta como ausente.
 */

const TOKEN_SUFFIXES = ["BLOB_READ_WRITE_TOKEN", "READ_WRITE_TOKEN"] as const;

/**
 * Los stores conectados a un proyecto pueden autenticar con OIDC en vez de un
 * token de larga duración. Si Vercel expone ese token, el SDK lo usa solo.
 */
export function hasOidcAuth(env: NodeJS.ProcessEnv = process.env) {
  return Boolean((env.VERCEL_OIDC_TOKEN ?? "").trim());
}

/** ¿Hay alguna credencial utilizable, por token explícito o por OIDC? */
export function blobIsConfigured(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(resolveBlobToken(env)) || hasOidcAuth(env);
}

export function resolveBlobToken(env: NodeJS.ProcessEnv = process.env): { token: string; source: string } | null {
  for (const suffix of TOKEN_SUFFIXES) {
    const exact = (env[suffix] ?? "").trim();
    if (exact) return { token: exact, source: suffix };

    for (const key of Object.keys(env)) {
      if (key === suffix || !key.endsWith(`_${suffix}`)) continue;
      const value = (env[key] ?? "").trim();
      if (value) return { token: value, source: key };
    }
  }
  return null;
}

export function missingBlobTokenMessage() {
  return [
    "El almacenamiento de archivos no está configurado.",
    "",
    "No encontré ni un token de Blob (BLOB_READ_WRITE_TOKEN, o cualquier variable",
    "terminada en _READ_WRITE_TOKEN, que la integración puede prefijar con el nombre",
    "del store) ni credenciales OIDC del proyecto.",
    "",
    "En Vercel: Storage → Blob → Connect Project. Si el store figura conectado pero no",
    "inyectó el token, suele ser porque ya existe una variable BLOB_READ_WRITE_TOKEN",
    "vacía creada a mano: borrala y volvé a conectar. Después hay que redeployar.",
  ].join("\n");
}
