import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/log-in" element={<LogIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
