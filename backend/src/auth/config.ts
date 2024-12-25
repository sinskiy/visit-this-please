import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../db/config.ts";
import bcrypt from "bcryptjs";
import MongoStore from "connect-mongo";
import session from "express-session";
import env from "../lib/env.ts";

export const userSession = session({
  secret: env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: env.DB_URL }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 7,
  },
});

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await User.findOne({ username });

      if (!user || !user.username) {
        return cb(null, false, { message: "Incorrect username or password" });
      }

      const isPasswordCorrect = bcrypt.compare(password, user.password!);
      if (!isPasswordCorrect) {
        return cb(null, false, { message: "Incorrect username or password" });
      }

      return cb(null, { id: user.id, username: user.username });
    } catch (e) {
      return cb(e);
    }
  })
);

passport.serializeUser((user, cb) => {
  // not sure what nextTick is for, but i follow the docs
  process.nextTick(() => cb(null, { id: user?.id, username: user?.username }));
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => cb(null, user as Express.User));
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}
