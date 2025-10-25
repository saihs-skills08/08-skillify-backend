import { Hono } from "hono";
import { mkdir, rm } from "node:fs/promises";
import { $ } from "bun";

const app = new Hono();

app.post("/:language", async (c) => {
  const language = c.req.param("language");
  if (language !== "java" && language !== "kt")
    return c.json({ error: "Unsupported language" }, 400);
  const code = await c.req.text();

  const dirName = crypto.randomUUID();
  const fileName = `Main.${language}`;
  const dir = `${process.cwd()}/public/${dirName}`;
  const filePath = `${dir}/${fileName}`;

  await mkdir(dir);
  Bun.write(filePath, code);

  const formatter = language === "java" ? "javafmt.jar" : "ktfmt.jar";
  await $`java -jar ./formatters/${formatter} ${language === "java" && "--replace"} ${filePath}`.quiet();
  const formattedCode = Bun.file(filePath);

  return c.text(
    await formattedCode.text().finally(async () => {
      await rm(dir, { recursive: true, force: true });
    }),
    200,
  );
});
export default app;
