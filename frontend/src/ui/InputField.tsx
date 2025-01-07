import {
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ReactNode,
  RefObject,
} from "react";
import { FieldError, RefCallBack } from "react-hook-form";
import styled from "styled-components";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: ReactNode;
  type: HTMLInputTypeAttribute;
  error: FieldError | undefined;
  hideLabel?: boolean;
  ref?: RefObject<HTMLInputElement> | RefCallBack;
}

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  color: var(--on-surface-variant);
  font-size: 0.875rem;
`;

const Input = styled.input<{ $isError: boolean }>`
  width: 100%;
  background-color: var(--surface-container-highest);
  color: var(--on-surface);
  border: none;
  outline: ${(props) =>
    props.$isError ? "2px solid var(--error)" : "1px solid var(--outline)"};
  border-radius: 4px;
  &::placeholder {
    color: var(--on-surface);
    opacity: 0.5;
  }
  &:focus {
    outline: 2px solid var(--primary);
  }
`;

export default function InputField({
  id,
  name = id,
  label = id,
  type,
  error,
  hideLabel,
  ...props
}: InputFieldProps) {
  return (
    <>
      <Label htmlFor={id} className={hideLabel ? "sr-only" : ""}>
        {label}
      </Label>
      <Input
        $isError={!!error?.message}
        type={type}
        id={id}
        name={name}
        {...props}
      />
      <p className="error-text">{error?.message}</p>
    </>
  );
}
