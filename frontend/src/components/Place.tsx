import { getFormattedPlace, PlaceById, type Place } from "../lib/places";
import { useContext, useRef } from "react";
import { UserContext } from "../user";
import { useVote, VoteType } from "../lib/votes";
import Comments from "./comments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryApi } from "../lib/fetch";
import EditPlace from "./EditPlace";
import styled from "styled-components";
import CheckboxField from "../ui/CheckboxField";

const ManagePlace = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export default function Place({
  place,
  comments = false,
}: {
  place: Place | PlaceById;
  comments?: boolean;
}) {
  const { user } = useContext(UserContext);
  const isMine = "userId" in place && user?.id === place.userId;

  const { isDeleting, isDeleteError, deleteError, deletePlace } =
    useDeletePlace();

  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <h2>{getFormattedPlace(place)}</h2>
      {isMine &&
        (place.votesLength === 0 ||
          (place.votesLength === 1 && place.voted !== undefined)) && (
          <ManagePlace>
            <button onClick={() => deletePlace(place._id)}>delete</button>
            <button onClick={() => dialogRef.current?.showModal()}>edit</button>
            <EditPlace
              isCountrySelectedDefault={true}
              place={place}
              dialogRef={dialogRef}
            />
          </ManagePlace>
        )}
      {isDeleting ? (
        <p>deleting...</p>
      ) : (
        isDeleteError && <p>{deleteError!.message}</p>
      )}
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

function useDeletePlace() {
  const queryClient = useQueryClient();

  const {
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
    mutate: deletePlace,
  } = useMutation({
    mutationFn: (placeId: string) =>
      queryApi(`/places/${placeId}`, {
        method: "DELETE",
        credentials: "include",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["places"] }),
  });

  return { isDeleting, isDeleteError, deleteError, deletePlace };
}

const StyledVotes = styled.div`
  margin-bottom: 1rem;
`;

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
    <StyledVotes>
      <CheckboxField
        type="radio"
        onChange={() => mutate({ type: "UP", id: placeId })}
        disabled={!user || isVoteLoading}
        checked={voted === "UP"}
        id={`vote-${placeId}-up`}
        label={`up ${up}`}
      />
      <CheckboxField
        type="radio"
        onChange={() => mutate({ type: "DOWN", id: placeId })}
        disabled={!user || isVoteLoading}
        checked={voted === "DOWN"}
        id={`vote-${placeId}-down`}
        label={`down ${down}`}
      />
    </StyledVotes>
  );
}
