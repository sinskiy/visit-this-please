import { useQuery } from "@tanstack/react-query";
import { queryApi } from "./lib/fetch";
import { PropsWithChildren, useEffect, useState } from "react";
import { User, UserContext } from "./user";

export default function Provider({ children }: PropsWithChildren) {
  const {
    user,
    setUser,
    query: { isLoading, isError, error },
  } = useUser();

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, isError, error }}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: () => queryApi("/auth", { credentials: "include" }),
  });

  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    if (query.data) {
      if (!("error" in query.data) && !user) {
        setUser(query.data);
      } else if ("error" in query.data && user) {
        setUser(null);
      }
    }

    if (query.error) {
      setUser(null);
    }
  }, [query.data, query.error]);

  return { user, setUser, query };
}
