import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { spawn } from "bun-pty";
import { mkdir, rm } from "node:fs/promises";
import RunRoute from "./routes/run";
import FormatRoute from "./routes/formatter";

const { upgradeWebSocket, websocket } = createBunWebSocket();
const app = new Hono();

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (c.req.method === "OPTIONS") {
    return c.text("OK", 200);
  }
  await next();
});

console.log("--08 Skillify backend");
console.log("Server is running on http://localhost:8000");
rm("./public", { recursive: true, force: true }).then(() => {
  mkdir("./public");
});

const folderSetup = async () => {
  const folderName = crypto.randomUUID();
  await mkdir(`./public/${folderName}`);
  return folderName;
};

app.get("/", (c) => c.text("08 Skillify Backend"));

app.route("/run", RunRoute);
app.route("/format", FormatRoute);

app.get(
  "/shell",
  upgradeWebSocket(async () => {
    const folderName = await folderSetup();
    const folderPath = `${process.cwd()}/public/${folderName}`;
    const shell = spawn("bash", [], {
      name: "xterm-256color",
      cwd: folderPath,
    });

    return {
      onOpen: (event, ws) => {
        shell.write("clear\r");
        shell.onData((data) => {
          ws.send(
            JSON.stringify({
              type: "shell",
              data: data,
            } as ShellResponse),
          );
        });
      },
      onMessage: (event: any, ws) => {
        const clientResponse: ShellResponse = JSON.parse(event.data);
        if (clientResponse.type == "code") {
          const file: CodeFile = clientResponse.data;
          Bun.write(`${folderPath}/${file.filename}`, file.content);
          shell.write(`clear\r`);
          shell.write(`java ${file.filename}\r`);
        } else {
          shell.write(clientResponse.data);
        }
      },
      onClose: async () => {
        shell.kill();
        await rm(folderPath, { recursive: true, force: true });
      },
    };
  }),
);

Bun.serve({
  fetch: app.fetch,
  websocket,
  port: 8000,
});
