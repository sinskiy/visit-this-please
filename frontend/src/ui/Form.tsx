import { UseMutationResult } from "@tanstack/react-query";
import { ComponentType, FormEventHandler, PropsWithChildren } from "react";
import styled from "styled-components";

const StyledForm = styled.form<{ $row: boolean }>`
  display: flex;
  ${(props) => !props.$row && "flex-direction: column"};
  gap: 8px;
`;

const BodyWrapper = styled.div`
  width: fit-content;
`;

export default function Form<R, T>({
  disabled,
  mutation,
  onSubmit,
  children,
  name,
  customButton,
  $row = false,
}: {
  mutation: UseMutationResult<R, Error, T>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
  name?: string;
  customButton?: ComponentType;
  $row?: boolean;
} & PropsWithChildren) {
  const Button = customButton ?? "button";
  return (
    <StyledForm onSubmit={onSubmit} $row={$row}>
      {name && <h3>{name}</h3>}
      <BodyWrapper>{children}</BodyWrapper>
      <Button
        type="submit"
        disabled={disabled || mutation.isPending}
        className="primary"
      >
        submit
      </Button>
      {mutation.isError && <p>{mutation.error.message}</p>}
    </StyledForm>
  );
}
