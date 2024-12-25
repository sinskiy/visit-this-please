import { use } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../db/config.ts";
import { compare } from "bcryptjs";
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

use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return cb(null, false, { message: "Incorrect username or password" });
      }

      const isPasswordCorrect = compare(password, user.password!);
      if (!isPasswordCorrect) {
        return cb(null, false, { message: "Incorrect username or password" });
      }

      return cb(null, { username: user.username });
    } catch (e) {
      return cb(e);
    }
  })
);
