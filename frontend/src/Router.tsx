import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./Layout";
import NotFound from "./pages/not-found";
import SignUp from "./pages/sign-up";
import Home from "./pages/home";
import LogIn from "./pages/log-in";

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
