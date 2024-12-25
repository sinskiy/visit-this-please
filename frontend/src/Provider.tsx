import { useQuery } from "@tanstack/react-query";
import { queryApi } from "./lib/fetch";
import { PropsWithChildren, useState } from "react";
import { User, UserContext } from "./user";

export default function Provider({ children }: PropsWithChildren) {
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => queryApi("/auth", { credentials: "include" }),
  });

  const [user, setUser] = useState<null | User>(null);
  if (data && !user) {
    setUser(data.user);
  }

  return (
    <UserContext.Provider value={{ user, setUser, isError, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}
