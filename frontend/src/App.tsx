import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { mutateApi } from "./lib/fetch";
import { handleSubmit } from "./lib/events";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SignUp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function SignUp() {
  const { isPending, isError, error, mutate } = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => mutateApi("POST", "/sign-up", { username, password }),
  });

  if (isError) {
    console.error(error);
  }

  function signUpAction(formData: FormData) {
    mutate({
      username: formData.get("username")! as string,
      password: formData.get("password")! as string,
    });
  }

  return (
    <form onSubmit={(e) => signUpAction(handleSubmit(e))}>
      <input
        type="text"
        name="username"
        id="username"
        autoComplete="username"
      />
      <input
        type="password"
        name="password"
        id="password"
        autoComplete="new-password"
      />
      <button type="submit" disabled={isPending}>
        submit
      </button>
      {isError && error.message}
    </form>
  );
}
