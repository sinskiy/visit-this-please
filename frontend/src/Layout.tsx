import { useContext } from "react";
import { NavLink, Outlet } from "react-router";
import { UserContext } from "./user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "./lib/fetch";

export default function Layout() {
  const { user, setUser, isLoading } = useContext(UserContext);

  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    mutationFn: () => mutateApi("POST", "/log-out"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setUser(null);
    },
  });

  return (
    <>
      <header>
        <NavLink to="/">home</NavLink>
        {!user && !isLoading && (
          <>
            <NavLink to="/log-in">log in</NavLink>
            <NavLink to="/sign-up">sign up</NavLink>
          </>
        )}
        {user && (
          <button onClick={() => mutate()} disabled={isPending}>
            log out
          </button>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
