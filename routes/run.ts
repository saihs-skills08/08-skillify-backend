import { spawn } from "bun-pty";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { cp, mkdir, rm } from "node:fs/promises";

const app = new Hono();

const ktWarning = `
OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release.
`.trim();

app.get(
  "/:language",
  upgradeWebSocket(async (c) => {
    const language = c.req.param("language");
    let shell: any = null;

    return {
      onClose: async () => {
        if (shell) {
          shell.kill();
        }
      },
      onMessage: async (event, ws) => {
        const req: ShellResponse = JSON.parse(event.data as string);
        if (req.type === "code") {
          const file: CodeFile = req.data;
          const folderName = crypto.randomUUID();
          const folderPath = `${process.cwd()}/public/${folderName}`;
          await mkdir(folderPath);
          await cp("./RunCode.sh", `${folderPath}/RunCode.sh`);
          Bun.write(`./public/${folderName}/${file.filename}`, file.content);
          shell = spawn("./RunCode.sh", [language, `./${file.filename}`], {
            name: folderName,
            cwd: folderPath,
          });
          shell.onData((data: string) => {
            console.log(data);
            if (!data.trim().includes(ktWarning)) {
              ws.send(
                JSON.stringify({
                  type: "shell",
                  data: data,
                } as ShellResponse),
              );
            }
          });
          shell.onExit(async () => {
            await rm(folderPath, { recursive: true, force: true });
            ws.close();
          });
        } else {
          shell.write(req.data);
        }
      },
    };
  }),
);

export default app;
