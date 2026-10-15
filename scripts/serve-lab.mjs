import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const distDir = join(root, "dist");
const bundlePath = join(distDir, "dist.js");
const port = Number(process.env.LAB_PORT ?? process.env.PORT ?? 8765);
const host = process.env.LAB_HOST ?? "0.0.0.0";

if (!existsSync(bundlePath)) {
  console.log("==> Bundle ausente; rodando npm run build ...");
  const build = spawnSync("npm", ["run", "build"], { cwd: root, stdio: "inherit" });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

createServer((req, res) => {
  const raw = req.url?.split("?")[0] ?? "/";
  let filePath;
  if (raw.startsWith("/dist/")) {
    filePath = join(distDir, raw.slice("/dist/".length));
  } else if (raw === "/") {
    filePath = join(publicDir, "lab.html");
  } else {
    filePath = join(publicDir, raw.replace(/^\//, ""));
  }
  try {
    const data = readFileSync(filePath);
    const ext = filePath.split(".").pop();
    const type =
      ext === "html"
        ? "text/html; charset=utf-8"
        : ext === "js"
          ? "application/javascript"
          : ext === "css"
            ? "text/css"
            : "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Não encontrado");
  }
}).listen(port, host, () => {
  const base =
    host === "0.0.0.0" ? `http://127.0.0.1:${port}` : `http://${host}:${port}`;
  console.log("");
  console.log("  Socura — laboratório local");
  console.log("  ───────────────────────────────");
  console.log(`  Início (hub):              ${base}/`);
  console.log(`  Pré-visualização Instagram: ${base}/preview.html`);
  console.log(`  Pré-visualização X:         ${base}/preview-x.html`);
  console.log(`  Copiar script:              ${base}/index.html`);
  console.log("");
  console.log("  Rede real: copie o script em index.html e cole no console de");
  console.log("  instagram.com ou x.com (logado). A pré-visualização não chama a rede.");
  console.log("");
  console.log("  Ctrl+C para encerrar");
});
