import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const distDir = join(root, "dist");

const port = Number(process.env.E2E_PORT ?? 4173);

createServer((req, res) => {
  const raw = req.url?.split("?")[0] ?? "/";
  let filePath;
  if (raw.startsWith("/dist/")) {
    filePath = join(distDir, raw.slice("/dist/".length));
  } else {
    filePath = join(publicDir, raw === "/" ? "index.html" : raw.replace(/^\//, ""));
  }
  try {
    const data = readFileSync(filePath);
    const ext = filePath.split(".").pop();
    const type =
      ext === "html"
        ? "text/html"
        : ext === "js"
          ? "application/javascript"
          : ext === "css"
            ? "text/css"
            : "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(port, () => {
  console.log(`e2e static server http://127.0.0.1:${port}`);
});
