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
    <Form mutation={mutation} onSubmit={handleSubmit(onSignUp)}>
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
        autoComplete="new-password"
        {...register("password")}
        error={errors.password}
      />
      <InputField
        id="confirm-password"
        label="confirm password"
        type="password"
        autoComplete="new-password"
        {...register("confirmPassword")}
        error={errors.confirmPassword}
      />
    </Form>
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
