import { mutateApi } from "../lib/fetch";
import { infer as inferType, object, string } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { UserContext } from "../user";
import { useNavigate } from "react-router";
import InputField from "../ui/InputField";
import Form from "../ui/Form";

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

const logInSchema = object({
  username: string().min(1).max(100),
  password: string().min(1).max(100),
});

type LogInSchema = inferType<typeof logInSchema>;
