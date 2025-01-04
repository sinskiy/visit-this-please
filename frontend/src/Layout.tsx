import { useContext } from "react";
import { NavLink, Outlet } from "react-router";
import { UserContext } from "./user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "./lib/fetch";
import styled from "styled-components";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const Nav = styled.div`
  display: flex;
  gap: 8px;
`;

export default function Layout() {
  const { user, setUser, isLoading, isError, error } = useContext(UserContext);

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
      <Header>
        <NavLink to="/">home</NavLink>
        {!user && !isLoading && (
          <Nav>
            <NavLink to="/log-in">log in</NavLink>
            <NavLink to="/sign-up">sign up</NavLink>
          </Nav>
        )}
        {user && (
          <button onClick={() => mutate()} disabled={isPending}>
            log out
          </button>
        )}
      </Header>
      <main>
        {isError && error!.message !== "Unauthorized" && (
          <p>{error!.message}</p>
        )}
        <Outlet />
      </main>
    </>
  );
}
