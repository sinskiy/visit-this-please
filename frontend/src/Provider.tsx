import { useQuery } from "@tanstack/react-query";
import { queryApi } from "./lib/fetch";
import { PropsWithChildren, useEffect, useState } from "react";
import { User, UserContext } from "./user";

export default function Provider({ children }: PropsWithChildren) {
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => queryApi("/auth", { credentials: "include" }),
  });

  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    if (data) {
      if ("user" in data && !user) {
        setUser(data.user);
      } else if (!("user" in data) && user) {
        setUser(null);
      }
    }
  }, [data]);

  return (
    // TODO: better handle error and loading
    <UserContext.Provider value={{ user, setUser, isError, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}
