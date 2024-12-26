import { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  type: HTMLInputTypeAttribute;
  error: FieldError | undefined;
}

export default function InputField({
  id,
  name = id,
  label = id,
  type,
  error,
  ...props
}: InputFieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input type={type} id={id} name={name} {...props} />
      <p>{error?.message}</p>
    </>
  );
}
