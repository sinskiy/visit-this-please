import { lazy } from "react";

export const LazyHome = lazy(() => import("@/pages/home"));
export const LazyLogIn = lazy(() => import("@/pages/log-in"));
export const LazySignUp = lazy(() => import("@/pages/sign-up"));
export const LazyPlace = lazy(() => import("@/pages/place-page"));
