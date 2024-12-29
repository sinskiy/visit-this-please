import { ChangeEvent, useMemo, useState } from "react";
import InputField from "./InputField";
import { FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { AddPlaceSchema } from "../components/AddPlace";

interface InputFieldWithSelectProps {
  // TODO: dynamic schema
  id: keyof AddPlaceSchema;
  values: readonly string[];
  isSelected: boolean;
  setIsSelected: (state: boolean) => void;
  register: UseFormRegister<AddPlaceSchema>;
  error: FieldError | undefined;
  setValue: UseFormSetValue<AddPlaceSchema>;
}

let timeout: NodeJS.Timeout;
export default function InputFieldWithSelect({
  id,
  values,
  isSelected,
  setIsSelected,
  error,
  setValue,
  register,
}: InputFieldWithSelectProps) {
  const [search, setSearch] = useState("");

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
    }, 1000);
  }

  return (
    <>
      <InputField
        id={id}
        type="text"
        error={error}
        {...register(id, { onChange: handleChange })}
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