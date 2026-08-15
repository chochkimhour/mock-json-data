export function matchPath(
  pattern: string,
  actual: string,
): Record<string, string> | null {
  const a = actual.replace(/\/$/, "").split("/").filter(Boolean);
  const p = pattern.replace(/\/$/, "").split("/").filter(Boolean);
  if (a.length !== p.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}
