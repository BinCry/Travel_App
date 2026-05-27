import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildOpenApiDocument } from "../src/openapi/buildOpenApiDocument.ts";

const dir = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(dir, "..", "docs");
const outputPath = path.join(docsDir, "openapi.json");

await mkdir(docsDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`, "utf8");

console.log(`[openapi] wrote ${outputPath}`);
