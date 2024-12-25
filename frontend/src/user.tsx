import { createContext, Dispatch, SetStateAction } from "react";

export interface User {
  id: string;
  username: string;
}

export const UserContext = createContext<{
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
