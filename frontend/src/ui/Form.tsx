import { UseMutationResult } from "@tanstack/react-query";
import { FormEventHandler, PropsWithChildren } from "react";

export default function Form<R, T>({
  mutation,
  onSubmit,
  children,
}: {
  mutation: UseMutationResult<R, Error, T>;
  onSubmit: FormEventHandler<HTMLFormElement>;
} & PropsWithChildren) {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <button type="submit" disabled={mutation.isPending}>
        submit
      </button>
      <p>{mutation.isError && mutation.error.message}</p>
    </form>
  );
}
