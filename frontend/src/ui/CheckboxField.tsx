import { InputHTMLAttributes, RefObject } from "react";
import { RefCallBack } from "react-hook-form";
import styled from "styled-components";

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  type: "checkbox" | "radio";
  ref?: RefObject<HTMLInputElement> | RefCallBack;
}

const Field = styled.div`
  display: flex;
  gap: 4px;
`;

export default function CheckboxField({
  id,
  name = id,
  label = id,
  type,
  ...props
}: CheckboxFieldProps) {
  return (
    <Field>
      <input type={type} id={id} name={name} {...props} />
      <label htmlFor={id}>{label}</label>
    </Field>
  );
}
