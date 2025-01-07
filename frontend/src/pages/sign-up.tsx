import { mutateApi } from "@/lib/fetch";
import {
  check,
  forward,
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

export default function SignUp() {
  const { mutation, onSignUp } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({ resolver: valibotResolver(signUpSchema) });

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  return (
    <Form mutation={mutation} onSubmit={handleSubmit(onSignUp)} name="sign up">
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

const signUpSchema = pipe(
  object({
    username: pipe(string(), nonEmpty(), maxLength(100)),
    password: pipe(string(), nonEmpty(), maxLength(100)),
    confirmPassword: pipe(string(), nonEmpty(), maxLength(100)),
  }),
  forward(
    check(
      (data) => data.password === data.confirmPassword,
      "Passwords do not match"
    ),
    ["confirmPassword"]
  )
);

type SignUpSchema = InferOutput<typeof signUpSchema>;
