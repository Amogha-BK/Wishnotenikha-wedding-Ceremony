import fs from "node:fs";
import path from "node:path";
import { build } from "vite";

const args = process.argv.slice(2);
if (args.length !== 4 || args[0] !== "--config" || args[2] !== "--outDir") {
  throw new Error(
    "Usage: npm run build:invitation -- --config /path/order.json --outDir build-orders/order-id",
  );
}
const config = path.resolve(args[1]);
const outDir = path.resolve(args[3]);
const ordersRoot = path.resolve("build-orders");
if (!outDir.startsWith(ordersRoot + path.sep) || fs.existsSync(outDir))
  throw new Error(
    "Choose a NEW directory under build-orders/. Existing output is never overwritten.",
  );
fs.mkdirSync(ordersRoot, { recursive: true });
// Reject symlinked output ancestors that could redirect writes outside build-orders/.
for (let dir = path.dirname(outDir); dir !== path.dirname(ordersRoot); dir = path.dirname(dir)) {
  if (fs.existsSync(dir) && fs.lstatSync(dir).isSymbolicLink())
    throw new Error("Output directories must not be symlinks.");
}
process.env.WISHNOTE_CUSTOMER_CONFIG = config;
delete process.env.WISHNOTE_EDITOR;
await build({ publicDir: false, build: { outDir, emptyOutDir: false, sourcemap: false } });
console.log(
  `Private local build ready: ${path.relative(process.cwd(), outDir)}. Nothing was deployed.`,
);
