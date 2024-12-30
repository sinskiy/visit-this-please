import { useQuery } from "@tanstack/react-query";
import Place from "../components/Place";
import { queryApi } from "../lib/fetch";
import { useParams } from "react-router";
import { PlaceById } from "../lib/places";

export default function PlacePage() {
  // ? add readable id
  const { id } = useParams();
  // TODO: better errors and loading

  const { data, isError, isLoading, error } = usePlace(id ?? "");
  if (isLoading) {
    return <p>loading...</p>;
  } else if (isError) {
    return <p>{error.message}</p>;
  } else {
    return <Place place={data!} comments />;
  }
}

function usePlace(id: string) {
  const query = useQuery<PlaceById>({
    queryKey: ["places", id],
    queryFn: () =>
      queryApi(`/places/${id}`, {
        credentials: "include",
      }),
  });

  return query;
}
