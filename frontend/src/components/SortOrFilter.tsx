import { SelectHTMLAttributes } from "react";
import styled from "styled-components";

interface SortProps extends SelectHTMLAttributes<HTMLSelectElement> {
  types: string[];
  value: string;
  setValue: (type: string) => void;
  isSort: boolean;
  $isUser?: boolean;
}

const Select = styled.select`
  background-color: var(--surface-container-highest);
  color: var(--on-surface);
  border: none;
  outline: 1px solid var(--outline);
  border-radius: 4px;
  &:focus {
    outline: 2px solid var(--primary);
  }
`;

export default function Sort({
  types,
  value,
  setValue,
  isSort,
  ...props
}: SortProps) {
  return (
    <Select
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
    </Select>
  );
}
