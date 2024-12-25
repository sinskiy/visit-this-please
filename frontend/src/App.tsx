import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SignUp from "./SignUp";
import Provider from "./Provider";

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
      <Provider>
        <SignUp />
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
