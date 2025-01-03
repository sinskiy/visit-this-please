import { getFormattedPlace, PlaceById, type Place } from "../lib/places";
import { useContext } from "react";
import { UserContext } from "../user";
import { useVote, VoteType } from "../lib/votes";
import Comments from "./comments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryApi } from "../lib/fetch";

export default function Place({
  place,
  comments = false,
}: {
  place: Place | PlaceById;
  comments?: boolean;
}) {
  const { user } = useContext(UserContext);
  const isMine = "userId" in place && user?.id === place.userId;

  const queryClient = useQueryClient();
  const { isPending, isError, error, mutate } = useMutation({
    mutationFn: (placeId: string) =>
      queryApi(`/places/${placeId}`, {
        method: "DELETE",
        credentials: "include",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["places"] }),
  });

  return (
    <>
      <p>{getFormattedPlace(place)}</p>
      {isMine &&
        (place.votesLength === 0 ||
          (place.votesLength === 1 && !place.voted)) && (
          <button onClick={() => mutate(place._id)}>delete</button>
        )}
      {isPending ? <p>deleting...</p> : isError && <p>{error.message}</p>}
      <Votes
        placeId={place._id}
        voted={place.voted}
        up={place.up}
        down={place.down}
      />
      {"votes" in place && comments && (
        <Comments
          placeId={place._id}
          voteId={place.userVote?._id}
          voteText={place.userVote?.text}
          votes={place.votes}
        />
      )}
    </>
  );
}

function Votes({
  placeId,
  down,
  up,
  voted,
}: {
  placeId: string;
  down: number;
  up: number;
  voted: VoteType | undefined;
}) {
  const { isPending: isVoteLoading, mutate } = useVote();
  const { user } = useContext(UserContext);

  return (
    <>
      <label htmlFor={`vote-${placeId}-up`}>up {up}</label>
      <input
        type="radio"
        name={`vote-${placeId}`}
        id={`vote-${placeId}-up`}
        onChange={() => mutate({ type: "UP", id: placeId })}
        disabled={!user || isVoteLoading}
        checked={voted === "UP"}
      />
      <label htmlFor={`vote-${placeId}-down`}>down {down}</label>
      <input
        type="radio"
        name={`vote-${placeId}`}
        id={`vote-${placeId}-down`}
        onChange={() => mutate({ type: "DOWN", id: placeId })}
        disabled={!user || isVoteLoading}
        checked={voted === "DOWN"}
      />
    </>
  );
}
