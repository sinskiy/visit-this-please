import { UseMutationResult } from "@tanstack/react-query";
import { FormEventHandler, PropsWithChildren } from "react";
import styled from "styled-components";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

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
    <StyledForm onSubmit={onSubmit}>
      <div>{children}</div>
      <button type="submit" disabled={disabled || mutation.isPending}>
        submit
      </button>
      {mutation.isError && <p>{mutation.error.message}</p>}
    </StyledForm>
  );
}
