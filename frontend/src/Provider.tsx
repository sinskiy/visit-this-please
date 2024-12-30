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
    console.log();
    if (data) {
      if (!("error" in data) && !user) {
        setUser(data);
      } else if ("error" in data && user) {
        setUser(null);
      }
    }

    if (error) {
      setUser(null);
    }
  }, [data, error]);

  return (
    // TODO: loading
    <UserContext.Provider value={{ user, setUser, isLoading, isError, error }}>
      {children}
    </UserContext.Provider>
  );
}
