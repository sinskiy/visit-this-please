import { mutateApi } from "../lib/fetch";
import { infer as inferType, object, string } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { UserContext } from "../user";
import { useNavigate } from "react-router";

export default function LogIn() {
  const { mutation, onLogIn } = useLogIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogInSchema>({ resolver: zodResolver(logInSchema) });

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  return (
    <form onSubmit={handleSubmit(onLogIn)}>
      <label htmlFor="username">username</label>
      <input
        type="text"
        id="username"
        autoComplete="username"
        {...register("username")}
      />
      <p>{errors.username?.message}</p>
      <label htmlFor="password">password</label>
      <input
        type="password"
        id="password"
        autoComplete="current-password"
        {...register("password")}
      />
      <p>{errors.password?.message}</p>
      <button type="submit" disabled={mutation.isPending}>
        submit
      </button>
      <p>{mutation.isError && mutation.error.message}</p>
    </form>
  );
}

function useLogIn() {
  const onLogIn: SubmitHandler<LogInSchema> = ({ username, password }) => {
    mutation.mutate({ username, password });
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => mutateApi("POST", "/log-in", { username, password }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["current-user"] }),
  });

  return { onLogIn, mutation };
}

const logInSchema = object({
  username: string().min(1).max(100),
  password: string().min(1).max(100),
});

type LogInSchema = inferType<typeof logInSchema>;
