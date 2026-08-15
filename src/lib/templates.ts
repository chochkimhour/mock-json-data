const fake = {
  uuid: () => crypto.randomUUID(),
  integer: () => String(Math.floor(Math.random() * 10000)),
  float: () => String(Number((Math.random() * 1000).toFixed(2))),
  boolean: () => String(Math.random() > 0.5),
  timestamp: () => String(Date.now()),
  date: () => new Date().toISOString().slice(0, 10),
  datetime: () => new Date().toISOString(),
  email: () => `user${Math.floor(Math.random() * 9999)}@example.test`,
  name: () =>
    ["Avery Chen", "Kimhour Sok", "Dara Lim"][Math.floor(Math.random() * 3)],
  firstName: () => "Avery",
  lastName: () => "Chen",
  company: () => "Acme Labs",
  url: () => "https://example.test",
  sentence: () => "A generated mock response.",
};
function valueAt(obj: unknown, path: string) {
  return path
    .split(".")
    .reduce<unknown>(
      (v, key) =>
        v && typeof v === "object"
          ? (v as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}
export function renderTemplate(
  value: unknown,
  context: {
    request: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
  },
): unknown {
  if (typeof value === "string")
    return value.replace(/{{\s*([\w.]+)\s*}}/g, (_, token) => {
      const generated = fake[token as keyof typeof fake];
      if (generated) return generated();
      const [scope, ...rest] = token.split(".");
      const found =
        scope === "request"
          ? valueAt(context.request, rest.join("."))
          : scope === "params"
            ? context.params[rest.join(".")]
            : scope === "query"
              ? context.query[rest.join(".")]
              : undefined;
      return found === undefined ? "" : String(found);
    });
  if (Array.isArray(value))
    return value.map((item) => renderTemplate(item, context));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        renderTemplate(v, context),
      ]),
    );
  return value;
}
