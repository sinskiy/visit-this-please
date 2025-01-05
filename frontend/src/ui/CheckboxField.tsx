import { InputHTMLAttributes, ReactNode, RefObject } from "react";
import { RefCallBack } from "react-hook-form";
import styled from "styled-components";

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string | ReactNode;
  type: "checkbox" | "radio";
  isCheckboxHidden?: boolean;
  ref?: RefObject<HTMLInputElement> | RefCallBack;
}

const Field = styled.div`
  display: flex;
  gap: 4px;
  position: relative;
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
`;

export default function CheckboxField({
  id,
  name = id,
  label = id,
  type,
  isCheckboxHidden = false,
  ...props
}: CheckboxFieldProps) {
  const Checkbox = isCheckboxHidden ? HiddenCheckbox : "input";
  return (
    <Field>
      <Checkbox type={type} id={id} name={name} {...props} />
      <label htmlFor={id}>{label}</label>
    </Field>
  );
}
