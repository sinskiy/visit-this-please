export default function Sort({
  types,
  value,
  setValue,
  isSort,
}: {
  types: string[];
  value: string;
  setValue: (type: string) => void;
  isSort: boolean;
}) {
  return (
    <select
      name={isSort ? "sort" : "filter"}
      id={isSort ? "sort" : "filter"}
      defaultValue={value}
      onChange={(e) => {
        setValue(e.currentTarget.value);
      }}
    >
      {types.map((type) => (
        <option key={type} value={type}>
          {type.replace(/-/g, " ")}
        </option>
      ))}
    </select>
  );
}
