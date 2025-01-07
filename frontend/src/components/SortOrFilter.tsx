import Label from "@/ui/Label";
import { SelectHTMLAttributes } from "react";
import styled from "styled-components";

interface SortProps extends SelectHTMLAttributes<HTMLSelectElement> {
  types: string[];
  value: string;
  setValue: (type: string) => void;
  isSort: boolean;
  $marginTop?: string;
  $isUser?: boolean;
}

const Wrapper = styled.div<{ $marginTop: string | undefined }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  ${(props) => props.$marginTop && `margin-top: ${props.$marginTop}`};
`;

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
  $marginTop,
  ...props
}: SortProps) {
  const id = isSort ? "sort" : "filter";
  return (
    <Wrapper $marginTop={$marginTop}>
      <Label htmlFor={id}>{id}</Label>
      <Select
        name={id}
        id={id}
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
    </Wrapper>
  );
}
