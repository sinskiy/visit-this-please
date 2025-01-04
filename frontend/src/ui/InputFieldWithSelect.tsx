import {
  ChangeEvent,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ReactNode,
  useMemo,
} from "react";
import InputField from "./InputField";
import { FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { EditPlaceSchema } from "../types/editPlaceSchema";
import styled from "styled-components";

interface InputFieldWithSelectProps
  extends InputHTMLAttributes<HTMLInputElement> {
  type: HTMLInputTypeAttribute;
  id: keyof EditPlaceSchema;
  label?: ReactNode;
  values: readonly string[];
  search: string;
  setSearch: (search: string) => void;
  isSelected: boolean;
  setIsSelected: (state: boolean) => void;
  register: UseFormRegister<EditPlaceSchema>;
  error: FieldError | undefined;
  setValue: UseFormSetValue<EditPlaceSchema>;
}

const Wrapper = styled.div`
  position: relative;
  width: fit-content;
`;

const List = styled.ul`
  position: absolute;
  top: 80%;
  right: 0;
  left: 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: scroll;
  & button {
    width: 100%;
    text-align: left;
    &:hover {
      opacity: 1;
      background-color: var(--surface-container-highest);
    }
  }
`;

let timeout: NodeJS.Timeout;
export default function InputFieldWithSelect({
  id,
  label = id,
  values,
  search,
  setSearch,
  isSelected,
  setIsSelected,
  error,
  setValue,
  register,
  ...props
}: InputFieldWithSelectProps) {
  const result = useMemo(
    () =>
      values.filter((country) =>
        country.toLowerCase().includes(search.toLowerCase() ?? "")
      ),
    [search]
  );

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (isSelected) {
      setIsSelected(false);
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setSearch(e.target.value);
    }, 500);
  }

  return (
    <Wrapper>
      <InputField
        id={id}
        label={label}
        error={error}
        {...register(id, { onChange: handleChange })}
        {...props}
      />
      {search && (
        <List role="list" hidden={isSelected}>
          {result.map((value) => (
            <li key={value}>
              <button
                onClick={() => {
                  setValue(id, value);
                  setSearch(value);
                  setIsSelected(true);
                }}
                type="button"
              >
                {value}
              </button>
            </li>
          ))}
        </List>
      )}
    </Wrapper>
  );
}
