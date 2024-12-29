import { UseMutationResult } from "@tanstack/react-query";
import { FormEventHandler, PropsWithChildren } from "react";

export default function Form<R, T>({
  disabled,
  mutation,
  onSubmit,
  children,
}: {
  mutation: UseMutationResult<R, Error, T>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
} & PropsWithChildren) {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <button type="submit" disabled={disabled || mutation.isPending}>
        submit
      </button>
      <p>{mutation.isError && mutation.error.message}</p>
    </form>
  );
}
