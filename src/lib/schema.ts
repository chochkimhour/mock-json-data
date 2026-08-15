import { z } from "zod";
type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  format?: string;
};
export function schemaToZod(schema: JsonSchema): z.ZodType {
  let base: z.ZodType = z.unknown();
  if (schema.enum)
    base = z.enum(
      schema.enum.filter((x): x is string => typeof x === "string") as [
        string,
        ...string[],
      ],
    );
  else if (schema.type === "string") {
    base = z.string();
    if (schema.minLength) base = (base as z.ZodString).min(schema.minLength);
    if (schema.maxLength) base = (base as z.ZodString).max(schema.maxLength);
    if (schema.format === "email") base = (base as z.ZodString).email();
  } else if (schema.type === "number" || schema.type === "integer") {
    base = z.number();
    if (schema.minimum !== undefined)
      base = (base as z.ZodNumber).min(schema.minimum);
    if (schema.maximum !== undefined)
      base = (base as z.ZodNumber).max(schema.maximum);
  } else if (schema.type === "boolean") base = z.boolean();
  else if (schema.type === "array")
    base = z.array(schemaToZod(schema.items ?? {}));
  else if (schema.type === "object") {
    const shape: Record<string, z.ZodType> = {};
    for (const [k, v] of Object.entries(schema.properties ?? {}))
      shape[k] = (schema.required ?? []).includes(k)
        ? schemaToZod(v)
        : schemaToZod(v).optional();
    base = z.object(shape);
  }
  return base;
}
