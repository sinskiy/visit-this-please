import { useQuery } from "@tanstack/react-query";
import { queryApi } from "./lib/fetch";
import { PropsWithChildren, useEffect, useState } from "react";
import { User, UserContext } from "./user";

export default function Provider({ children }: PropsWithChildren) {
  const { data, isLoading, isError, error } = useQuery({
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
    // TODO: loading
    <UserContext.Provider value={{ user, setUser, isLoading, isError, error }}>
      {children}
    </UserContext.Provider>
  );
}
