import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SignUp from "./SignUp";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";
import { queryApi } from "./lib/fetch";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (_count, { message }) => message !== "Unauthorized",
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SignUp />
      </UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export interface User {
  id: string;
  username: string;
}

function UserProvider({ children }: PropsWithChildren) {
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => queryApi("/auth", { credentials: "include" }),
  });

  const [user, setUser] = useState<null | User>(null);
  if (data) {
    setUser(data.user);
  }

  return (
    <UserContext.Provider value={{ user, setUser, isError, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

const UserContext = createContext<{
  user: null | User;
  setUser: Dispatch<SetStateAction<User | null>>;
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
}>({
  user: null,
  setUser: () => {},
  isError: false,
  isLoading: false,
  error: null,
});
