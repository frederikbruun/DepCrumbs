import type { StorageBackend } from "./types.js";
import { JsonStorage } from "./json-storage.js";
import { MarkdownStorage } from "./markdown-storage.js";

export function createStorage(
  path: string,
  format: "json" | "markdown",
): StorageBackend {
  if (format === "markdown") {
    return new MarkdownStorage(path);
  }
  return new JsonStorage(path);
}

export { JsonStorage } from "./json-storage.js";
export { MarkdownStorage } from "./markdown-storage.js";
export type { StorageBackend } from "./types.js";
