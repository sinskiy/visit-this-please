import { HTMLInputTypeAttribute, InputHTMLAttributes, RefObject } from "react";
import { FieldError, RefCallBack } from "react-hook-form";
import styled from "styled-components";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  type: HTMLInputTypeAttribute;
  error: FieldError | undefined;
  hideLabel?: boolean;
  ref?: RefObject<HTMLInputElement> | RefCallBack;
}

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
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
      <input type={type} id={id} name={name} {...props} />
      <p>{error?.message}</p>
    </>
  );
}
