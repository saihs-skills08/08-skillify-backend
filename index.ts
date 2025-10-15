import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { spawn } from "bun-pty";
import { mkdir, rm } from "node:fs/promises";
import { cwd } from "node:process";
import RunRoute from "./routes/run";

const { upgradeWebSocket, websocket } = createBunWebSocket();
const app = new Hono();

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
