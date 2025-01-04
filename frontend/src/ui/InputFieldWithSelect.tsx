import {
  ChangeEvent,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  useMemo,
} from "react";
import InputField from "./InputField";
import { FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { EditPlaceSchema } from "../types/editPlaceSchema";

interface InputFieldWithSelectProps
  extends InputHTMLAttributes<HTMLInputElement> {
  type: HTMLInputTypeAttribute;
  // TODO: dynamic schema
  id: keyof EditPlaceSchema;
  values: readonly string[];
  search: string;
  setSearch: (search: string) => void;
  isSelected: boolean;
  setIsSelected: (state: boolean) => void;
  register: UseFormRegister<EditPlaceSchema>;
  error: FieldError | undefined;
  setValue: UseFormSetValue<EditPlaceSchema>;
}

let timeout: NodeJS.Timeout;
export default function InputFieldWithSelect({
  id,
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
    <>
      <InputField
        id={id}
        error={error}
        {...register(id, { onChange: handleChange })}
        {...props}
      />
      {search && (
        <ul>
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
        </ul>
      )}
    </>
  );
}
