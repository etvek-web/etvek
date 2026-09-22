/**
 * Resolución del token de Vercel Blob.
 *
 * Igual que con la conexión a Postgres, la integración no siempre usa el nombre
 * canónico: al vincular el store puede prefijar las variables con su nombre
 * (`ETVEK_READ_WRITE_TOKEN`). Una variable creada pero vacía cuenta como ausente.
 */

const TOKEN_SUFFIXES = ["BLOB_READ_WRITE_TOKEN", "READ_WRITE_TOKEN"] as const;

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
    "No hay token de Vercel Blob.",
    "",
    "Busqué BLOB_READ_WRITE_TOKEN y cualquier variable terminada en _READ_WRITE_TOKEN",
    "(la integración puede prefijarlas con el nombre del store).",
    "",
    "En Vercel: Storage → Blob → Connect Project, y revisá que la variable tenga valor.",
    "Una variable creada pero vacía cuenta como ausente. Después hay que redeployar.",
  ].join("\n");
}
