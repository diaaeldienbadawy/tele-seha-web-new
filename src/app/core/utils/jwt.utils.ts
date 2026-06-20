/**
 * Decodes a JWT payload without verification (verification is the server's responsibility).
 * Use only for reading client-side claims (e.g. role, userId).
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  if (!token?.trim()) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export interface JwtUserClaims {
  sub?: string;
  role?: string;
  PatientId?: number | string;
  DoctorId?: number | string;
  nameid?: string;
  /** .NET role claim */
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
}

/**
 * Returns role and userId from JWT payload, with fallbacks for common claim names.
 */
export function getJwtUserDetails(payload: JwtUserClaims | null): { role: string; userId: string } | null {
  if (!payload) return null;

  const role =
    payload.role ??
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    '';

  const userId =
    payload.PatientId != null
      ? String(payload.PatientId)
      : payload.DoctorId != null
        ? String(payload.DoctorId)
        : payload.sub ?? payload.nameid ?? '';

  if (!role || !userId) return null;
  return { role, userId };
}
