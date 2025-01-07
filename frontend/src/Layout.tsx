import { useContext } from "react";
import { NavLink, Outlet } from "react-router";
import { UserContext } from "@/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "@/lib/fetch";
import styled from "styled-components";
import Skeleton from "@/ui/Skeleton";
import Logo from "@/assets/logo.svg";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const Nav = styled.nav`
  display: flex;
`;

const LogoLink = styled(NavLink)`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.5rem;
  gap: 0.5rem;
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

const Button = styled.button`
  height: fit-content;
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
        <LogoLink to="/">
          <img src={Logo} width={96} height={48} alt="" />
          visit this, please!
        </LogoLink>
        {!user &&
          (!isLoading ? (
            <Nav>
              <MyLink to="/log-in">log in</MyLink>
              <MyLink to="/sign-up">sign up</MyLink>
            </Nav>
          ) : (
            <Skeleton $width="96px" $height="16px" />
          ))}
        {user && (
          <Button onClick={() => mutate()} disabled={isPending}>
            log out
          </Button>
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
