import { createServer } from "vite";

// The editor is a local tool, not an authentication-protected public route.
process.env.WISHNOTE_EDITOR = "1";
delete process.env.WISHNOTE_CUSTOMER_CONFIG;
const server = await createServer({
  server: { host: "127.0.0.1", port: 8444, strictPort: true, open: false },
});
await server.listen();
console.log("WishNote owner editor: http://127.0.0.1:8444/owner-editor.html");
