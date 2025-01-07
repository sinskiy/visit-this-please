import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "@/Layout";
import NotFound from "@/pages/not-found";
import { LazyHome, LazyLogIn, LazyPlace, LazySignUp } from "./pages/lazy";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LazyHome />} />
          <Route path="/log-in" element={<LazyLogIn />} />
          <Route path="/sign-up" element={<LazySignUp />} />
          <Route path="/:id" element={<LazyPlace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
