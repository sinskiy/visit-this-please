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

const MyLink = styled(NavLink)`
  padding: 0.25rem 1rem;
  border-radius: 6px;
  &.active {
    background-color: var(--primary);
    color: var(--on-primary);
    display: flex;
    place-items: center;
  }
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
        <MyLink to="/">home</MyLink>
        {!user &&
          (!isLoading ? (
            <nav>
              <MyLink to="/log-in">log in</MyLink>
              <MyLink to="/sign-up">sign up</MyLink>
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
