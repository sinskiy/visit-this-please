import { useQuery } from "@tanstack/react-query";
import Place from "@/components/Place";
import { queryApi } from "@/lib/fetch";
import { useParams } from "react-router";
import { PlaceById } from "@/lib/places";
import { usePlaceSort } from "@/lib/sort";
import Skeleton from "@/ui/Skeleton";

export default function PlacePage() {
  const { id } = useParams();

  const sort = usePlaceSort();

  const { data, isError, isLoading, error } = usePlace(id ?? "", sort);
  if (isLoading) {
    return (
      <>
        <Skeleton $height="24px" $width="70%" $marginTop="48px" />
        <Skeleton $height="16px" $width="32px" $marginTop="24px" />
        <Skeleton $height="16px" $width="64px" $marginTop="4px" />
        <Skeleton $height="20px" $width="96px" $marginTop="48px" />
        <Skeleton $height="96px" $width="256px" $marginTop="24px" />
        <Skeleton $height="24px" $width="96px" $marginTop="8px" />
        <Skeleton $height="32px" $width="196px" $marginTop="48px" />
        <Skeleton $height="196px" $width="100%" $marginTop="16px" />
        <Skeleton $height="196px" $width="100%" $marginTop="16px" />
        <Skeleton $height="196px" $width="100%" $marginTop="16px" />
      </>
    );
  } else if (isError) {
    return <p>{error?.message}</p>;
  } else {
    return <Place place={data!} comments />;
  }
}

function usePlace(id: string, sort: string) {
  const query = useQuery<PlaceById>({
    queryKey: ["places", id, { sort }],
    queryFn: () =>
      queryApi(`/places/${id}?sort=${sort}`, {
        credentials: "include",
      }),
  });

  return query;
}
