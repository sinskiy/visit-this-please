import { useContext, useRef } from "react";
import { UserContext } from "../user";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutateApi, queryApi } from "../lib/fetch";
import { getFormattedPlace, Place } from "../lib/places";
import AddPlace from "../components/AddPlace";

export default function Home() {
  const { user } = useContext(UserContext);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const { data, isLoading, isError, error } = useQuery<Place[]>({
    queryKey: ["places", user?.id],
    queryFn: () => queryApi("/places", { credentials: "include" }),
  });

  const {
    isPending: isVoteLoading,
    isError: isVoteError,
    error: voteError,
    mutate,
  } = useVote();

  return (
    <>
      <p>hello, {user?.username ?? "world"}</p>
      {user && (
        <button onClick={() => dialogRef.current?.showModal()}>
          add place
        </button>
      )}
      {/* TODO: better loading (skeleton) */}
      {isLoading === true ? (
        <p>loading...</p>
      ) : isError || !data ? (
        <p>{error?.message || "Unexpected error"}</p>
      ) : data.length > 0 ? (
        <ul>
          {data!.map((place) => (
            <li key={place._id}>
              <p>{getFormattedPlace(place)}</p>
              <Votes
                place={place}
                mutate={mutate}
                isVoteLoading={isVoteLoading}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>no places</p>
      )}
      {isVoteLoading ? (
        <p>voting...</p>
      ) : (
        isVoteError && <p>{voteError.message}</p>
      )}
      {createPortal(
        <dialog ref={dialogRef} id="add-place">
          <AddPlace dialogRef={dialogRef} />
          <form method="dialog">
            <button type="submit">cancel</button>
          </form>
        </dialog>,
        document.body
      )}
    </>
  );
}

function Votes({
  place,
  mutate,
  isVoteLoading,
}: {
  place: Place;
  mutate: ReturnType<typeof useVote>["mutate"];
  isVoteLoading: boolean;
}) {
  const { user } = useContext(UserContext);
  return (
    <>
      <label htmlFor={`vote-${place._id}-up`}>up {place.up}</label>
      <input
        type="radio"
        name={`vote-${place._id}`}
        id={`vote-${place._id}-up`}
        onChange={() => mutate({ type: "UP", id: place._id })}
        disabled={!user || isVoteLoading}
        checked={place.voted === "UP"}
      />
      <label htmlFor={`vote-${place._id}-down`}>down {place.down}</label>
      <input
        type="radio"
        name={`vote-${place._id}`}
        id={`vote-${place._id}-down`}
        onChange={() => mutate({ type: "DOWN", id: place._id })}
        disabled={!user || isVoteLoading}
        checked={place.voted === "DOWN"}
      />
    </>
  );
}

function useVote() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ type, id }: { type: "UP" | "DOWN"; id: string }) => {
      return mutateApi("PATCH", `/places/${id}/votes`, { type });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  return mutation;
}
