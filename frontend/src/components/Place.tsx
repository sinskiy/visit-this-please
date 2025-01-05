import { getFormattedPlace, PlaceById, type Place } from "../lib/places";
import { PropsWithChildren, useContext, useRef } from "react";
import { UserContext } from "../user";
import { useVote, VoteType } from "../lib/votes";
import Comments from "./comments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryApi } from "../lib/fetch";
import EditPlace from "./EditPlace";
import styled from "styled-components";
import CheckboxField from "../ui/CheckboxField";
import IconButton from "../ui/IconButton";

const ManagePlace = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const NameAndVotes = styled.div`
  display: flex;
  gap: 32px;
`;

export default function Place({
  place,
  comments = false,
  children,
}: {
  place: Place | PlaceById;
  comments?: boolean;
} & PropsWithChildren) {
  const { user } = useContext(UserContext);
  const isMine = "userId" in place && user?.id === place.userId;

  const { isDeleting, isDeleteError, deleteError, deletePlace } =
    useDeletePlace();

  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <NameAndVotes>
        <Votes
          placeId={place._id}
          voted={place.voted}
          up={place.up}
          down={place.down}
        />
        <div>
          <h2>{getFormattedPlace(place)}</h2>
          {children}
        </div>
      </NameAndVotes>
      {isMine &&
        (place.votesLength === 0 ||
          (place.votesLength === 1 && place.voted !== undefined)) && (
          <ManagePlace>
            <IconButton
              onClick={() => deletePlace(place._id)}
              aria-label="delete"
              className="icon"
            >
              <img src="/delete.svg" alt="" />
            </IconButton>
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
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: fit-content;
`;
const GeneralVoteCount = styled.p`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
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
        label={
          voted === "UP" ? (
            <img src="/up-filled.svg" alt="" />
          ) : (
            <img src="/up.svg" alt="" />
          )
        }
        isCheckboxHidden
      />
      <GeneralVoteCount>{up - down}</GeneralVoteCount>
      <CheckboxField
        type="radio"
        onChange={() => mutate({ type: "DOWN", id: placeId })}
        disabled={!user || isVoteLoading}
        checked={voted === "DOWN"}
        id={`vote-${placeId}-down`}
        label={
          voted === "DOWN" ? (
            <img
              src="/up-filled.svg"
              alt=""
              style={{ transform: "rotate(180deg)" }}
            />
          ) : (
            <img src="/up.svg" alt="" style={{ transform: "rotate(180deg)" }} />
          )
        }
        isCheckboxHidden
      />
    </StyledVotes>
  );
}
