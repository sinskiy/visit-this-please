import { mutateApi } from "../lib/fetch";
import { infer as inferType, object, string } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { UserContext } from "../user";
import { useNavigate } from "react-router";

export default function SignUp() {
  const { mutation, onSignUp } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({ resolver: zodResolver(signUpSchema) });

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  return (
    <form onSubmit={handleSubmit(onSignUp)}>
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
        autoComplete="new-password"
        {...register("password")}
      />
      <p>{errors.password?.message}</p>
      <label htmlFor="confirm-password">confirm password</label>
      <input
        type="password"
        id="confirm-password"
        autoComplete="new-password"
        {...register("confirmPassword")}
      />
      <p>{errors.confirmPassword?.message}</p>
      <button type="submit" disabled={mutation.isPending}>
        submit
      </button>
      <p>{mutation.isError && mutation.error.message}</p>
    </form>
  );
}

function useSignUp() {
  const onSignUp: SubmitHandler<SignUpSchema> = ({ username, password }) => {
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
    }) => mutateApi("POST", "/sign-up", { username, password }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["current-user"] }),
  });

  return { onSignUp, mutation };
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
