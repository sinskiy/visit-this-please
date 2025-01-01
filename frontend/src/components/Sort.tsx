export default function Sort({
  types,
  sort,
  setSort,
}: {
  types: string[];
  sort: string;
  setSort: (type: string) => void;
}) {
  return (
    <select
      name="sort"
      id="sort"
      defaultValue={sort}
      onChange={(e) => {
        setSort(e.currentTarget.value);
      }}
    >
      {types.map((type) => (
        <option key={type} value={type}>
          {type.replace("-", " ")}
        </option>
      ))}
    </select>
  );
}
