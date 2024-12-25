import { Router } from "express";
import { authenticate } from "passport";
import { ErrorWithStatus } from "../lib/error.ts";
import { hash } from "bcryptjs";
import { User } from "../db/config.ts";

const router = Router();

router.post("/sign-up", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ErrorWithStatus("No username or password", 400);
  }

  const hashedPassword = await hash(password, 10);
  const [user] = await User.insertMany({ username, password: hashedPassword });
  const sessionUser = { id: user?.id, username: user?.username };
  req.login(sessionUser, (err) => {
    if (err) {
      throw new ErrorWithStatus("Couldn't log in", 500);
    }
    res.json({ user: sessionUser });
  });
});

router.post(
  "/log-in",
  authenticate("local", {
    failureRedirect: "/log-in/error",
    successRedirect: "/auth",
  })
);

router.post("/log-out", (req, res) => {
  req.logout((err) => {
    if (err) {
      throw new ErrorWithStatus("Couldn't log out", 500);
    }
    res.json({ status: "success" });
  });
});

// TODO: make ESLint working
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get("/log-in/error", (_req, _res) => {
  throw new ErrorWithStatus("Unauthorized", 401);
});
