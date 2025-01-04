import { SelectHTMLAttributes } from "react";

interface SortProps extends SelectHTMLAttributes<HTMLSelectElement> {
  types: string[];
  value: string;
  setValue: (type: string) => void;
  isSort: boolean;
}

export default function Sort({
  types,
  value,
  setValue,
  isSort,
  ...props
}: SortProps) {
  return (
    <select
      name={isSort ? "sort" : "filter"}
      id={isSort ? "sort" : "filter"}
      defaultValue={value}
      onChange={(e) => {
        setValue(e.currentTarget.value);
      }}
      {...props}
    >
      {types.map((type) => (
        <option key={type} value={type}>
          {type.replace(/-/g, " ")}
        </option>
      ))}
    </select>
  );
}
