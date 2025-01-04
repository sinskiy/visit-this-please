import { UseMutationResult } from "@tanstack/react-query";
import { FormEventHandler, PropsWithChildren } from "react";
import styled from "styled-components";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export default function Form<R, T>({
  disabled,
  mutation,
  onSubmit,
  children,
  name,
}: {
  mutation: UseMutationResult<R, Error, T>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
  name?: string;
} & PropsWithChildren) {
  return (
    <StyledForm onSubmit={onSubmit}>
      {name && <h3>{name}</h3>}
      <div>{children}</div>
      <button type="submit" disabled={disabled || mutation.isPending}>
        submit
      </button>
      {mutation.isError && <p>{mutation.error.message}</p>}
    </StyledForm>
  );
}
