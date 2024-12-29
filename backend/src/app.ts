import express, {
  type NextFunction,
  type Response,
  type Request,
  json,
} from "express";
import { createServer } from "node:http";
import cors from "cors";
import { ErrorWithStatus } from "./lib/error.ts";
import { userSession } from "./auth/config.ts";
import env from "./lib/env.ts";
import authRouter from "./auth/router.ts";
import placesRouter from "./places.ts";
import passport from "passport";

export const app = express();
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(userSession);
app.use(passport.session());
app.use(json());
const server = createServer(app);

app.use("/", authRouter);
app.use("/places", placesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// TODO: for some reason argsIgnorePattern doesn't work
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: "internal server error" });
  }
});

const port = env.PORT;
server.listen(port, () => {
  if (env.NODE_ENV === "development") {
    console.log(`http://localhost:${port}`);
  }
});
