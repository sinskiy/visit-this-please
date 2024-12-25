import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { mutateApi } from "./lib/fetch";
import { infer as inferType, object, string } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const signUpSchema = object({
  username: string().min(1).max(100),
  password: string().min(1).max(100),
  confirmPassword: string().min(1).max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpSchema = inferType<typeof signUpSchema>;

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

  const onSignUp: SubmitHandler<SignUpSchema> = ({ username, password }) => {
    mutate({ username, password });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({ resolver: zodResolver(signUpSchema) });

  return (
    <form onSubmit={handleSubmit(onSignUp)}>
      <input
        type="text"
        id="username"
        autoComplete="username"
        {...register("username")}
      />
      <p>{errors.username?.message}</p>
      <input
        type="password"
        id="password"
        autoComplete="new-password"
        {...register("password")}
      />
      <p>{errors.password?.message}</p>
      <input
        type="password"
        id="confirm-password"
        autoComplete="new-password"
        {...register("confirmPassword")}
      />
      <p>{errors.confirmPassword?.message}</p>
      <button type="submit" disabled={isPending}>
        submit
      </button>
      <p>{isError && error.message}</p>
    </form>
  );
}
