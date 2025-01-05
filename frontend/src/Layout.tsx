import { useContext } from "react";
import { NavLink, Outlet } from "react-router";
import { UserContext } from "./user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "./lib/fetch";
import styled from "styled-components";
import Skeleton from "./ui/Skeleton";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
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
        {!user &&
          (!isLoading ? (
            <nav>
              <NavLink to="/log-in">log in</NavLink>
              <NavLink to="/sign-up">sign up</NavLink>
            </nav>
          ) : (
            <Skeleton $width="96px" $height="16px" />
          ))}
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
