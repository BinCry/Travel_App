import { buildOpenApiDocument } from "./buildOpenApiDocument.js";

export function loadOpenApiDocument(): Record<string, unknown> {
  return buildOpenApiDocument();
}
