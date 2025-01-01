import { useSearchParams } from "react-router";

export function usePlaceSort() {
  const [params] = useSearchParams();
  const sort = params.get("sort") ?? "last-added";
  return sort;
}
