import express, {
  type NextFunction,
  type Response,
  type Request,
} from "express";
import { createServer } from "node:http";
import env from "./env.ts";
import cors from "cors";
import { Test } from "./db/config.ts";

export const app = express();
app.use(cors({ origin: env.CLIENT_URL }));
const server = createServer(app);

app.get("/", async (_req, res) => {
  const test1 = await Test.findOne().exec();
  res.json({ hello: test1?.hello });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// TODO: for some reason argsIgnorePattern doesn't work
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = env.PORT;
server.listen(port, () => {
  if (env.NODE_ENV === "development") {
    console.log(`http://localhost:${port}`);
  }
});
