// Sesión simple del panel: cookie con un hash derivado de ADMIN_PASSWORD (funciona en Edge y Node).
export const ADMIN_COOKIE = "nb_admin";

export async function adminToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`neurobalance-admin:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isValidAdminCookie(value: string | undefined): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !value) return false;
  return value === (await adminToken(pw));
}
