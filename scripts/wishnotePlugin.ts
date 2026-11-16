import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { MAX_RECORD_BYTES, validateRecord } from "../src/invitation/schema";

export function wishnotePlugin(): Plugin {
  const editor = process.env.WISHNOTE_EDITOR === "1";
  const dataFile = process.env.WISHNOTE_CUSTOMER_CONFIG;
  const record = dataFile
    ? (() => {
        if (fs.statSync(dataFile).size > MAX_RECORD_BYTES)
          throw new Error("Customer JSON exceeds 24 MB.");
        return validateRecord(JSON.parse(fs.readFileSync(dataFile, "utf8")));
      })()
    : null;
  return {
    name: "wishnote-local-production",
    resolveId(id) {
      if (id === "virtual:wishnote-customer") return "\0wishnote-customer";
    },
    load(id) {
      if (id !== "\0wishnote-customer") return;
      return record
        ? `export const customerRecord = ${JSON.stringify(record)};`
        : 'export { customerRecord } from "/src/invitation/defaultRecord.ts";';
    },
    transform(code, id) {
      if (record && id.split("?")[0].endsWith("/src/index.css"))
        return code
          .split("/assets/shristi-harsh-celebration.png")
          .join("/assets/wedding-floral-arch-v2.webp");
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let pathname: string;
        try {
          pathname = path.posix.normalize(decodeURIComponent((req.url || "").split("?")[0]));
        } catch {
          res.statusCode = 400;
          return res.end("Invalid path");
        }
        if (
          !/(?:^|\/)owner-(?:editor|preview)\.html$/.test(pathname) &&
          !pathname.includes("/src/editor/")
        )
          return next();
        const host = req.headers.host || "";
        const remote = req.socket.remoteAddress;
        const local = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remote || "");
        const allowedHost = /^(?:127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(host);
        if (
          !editor ||
          !local ||
          !allowedHost ||
          (req.headers.origin && req.headers.origin !== `http://${host}`)
        ) {
          res.statusCode = 404;
          return res.end("Not found");
        }
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Referrer-Policy", "no-referrer");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
        next();
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        const removeInheritedMetadata = (source: string) =>
          source
            .replace(
              /<meta\b[^>]*(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|description)["'][^>]*>/gi,
              "",
            )
            .replace(/<link\b[^>]*rel=["'](?:icon|canonical)["'][^>]*>/gi, "")
            .replace(/<script\b(?![^>]*type=["']module)[^>]*>[\s\S]*?<\/script>/gi, "");
        if (context.filename?.includes("owner-")) {
          return removeInheritedMetadata(html).replace(
            /<title>[\s\S]*?<\/title>/,
            "<title>WishNote · Local owner workspace</title>",
          );
        }
        if (!record) return html;
        const escape = (v: string) =>
          v
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
        const title = `${record.couple.first} & ${record.couple.second} | Wedding Invitation`;
        // Remove inherited customer-specific metadata, analytics and injected scripts.
        html = removeInheritedMetadata(html).replace(
          /<title>[\s\S]*?<\/title>/,
          `<title>${escape(title)}</title>`,
        );
        return {
          html,
          tags: [
            {
              tag: "meta",
              attrs: { name: "description", content: record.invitationLine },
              injectTo: "head",
            },
            { tag: "meta", attrs: { property: "og:title", content: title }, injectTo: "head" },
            {
              tag: "meta",
              attrs: { name: "robots", content: "noindex, nofollow" },
              injectTo: "head",
            },
          ],
        };
      },
    },
    writeBundle(options) {
      if (!record) return;
      const out = path.resolve(options.dir || "dist");
      // Personalized builds copy only shared template assets and explicitly selected media.
      // Never copy the entire original customer's public directory into a new order.
      const files = new Set([
        "/assets/envelope-opening-safari.mp4",
        "/envelope-poster.jpg",
        "/assets/mehndi-floral-arch-v2.webp",
        "/assets/haldi-floral-arch-v2.webp",
        "/assets/wedding-floral-arch-v2.webp",
      ]);
      for (const file of [
        record.media.portraitUrl,
        record.media.venueArtworkUrl,
        record.optional.musicUrl,
        ...record.celebrations.map((e) => e.image),
      ])
        if (file.startsWith("/")) files.add(file);
      for (const file of files) {
        const src = path.resolve("public", file.slice(1));
        if (
          !fs.existsSync(src) ||
          !fs.statSync(src).isFile() ||
          !fs.realpathSync(src).startsWith(fs.realpathSync("public") + path.sep)
        )
          throw new Error(`Required media is missing or outside public/: ${file}`);
        const dest = path.join(out, file);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
      }
    },
  };
}
