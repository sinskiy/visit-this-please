import { mutateApi } from "@/lib/fetch";
import {
  InferOutput,
  maxLength,
  nonEmpty,
  object,
  pipe,
  string,
} from "valibot";
import { SubmitHandler, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { UserContext } from "@/user";
import { useNavigate } from "react-router";
import InputField from "@/ui/InputField";
import Form from "@/ui/Form";

export default function LogIn() {
  const { mutation, onLogIn } = useLogIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogInSchema>({ resolver: valibotResolver(logInSchema) });

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  return (
    <Form mutation={mutation} onSubmit={handleSubmit(onLogIn)} name="log in">
      <InputField
        id="username"
        type="text"
        autoComplete="username"
        {...register("username")}
        error={errors.username}
      />
      <InputField
        id="password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
        error={errors.password}
      />
    </Form>
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
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["current-user"] }),
  });

  return { onLogIn, mutation };
}

const logInSchema = pipe(
  object({
    username: pipe(string(), nonEmpty(), maxLength(100)),
    password: pipe(string(), nonEmpty(), maxLength(100)),
  })
);

type LogInSchema = InferOutput<typeof logInSchema>;
