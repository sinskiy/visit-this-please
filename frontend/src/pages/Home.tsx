import { useContext, useRef } from "react";
import { UserContext } from "../user";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutateApi, queryApi } from "../lib/fetch";
import { getFormattedPlace, Place } from "../lib/places";
import AddPlace from "../components/AddPlace";
import { useSearchParams } from "react-router";

export default function Home() {
  const { user } = useContext(UserContext);

  const [params, setParams] = useSearchParams();
  const sort = params.get("sort");
  const page = Number(params.get("page") ?? 1);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const { data, isLoading, isError, error } = useQuery<Place[]>({
    queryKey: ["places", user?.id, sort, page],
    queryFn: () =>
      queryApi(`/places?sort=${sort ?? "positivity"}&page=${page}`, {
        credentials: "include",
      }),
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
      <h1>places</h1>
      {user && (
        <button onClick={() => dialogRef.current?.showModal()}>
          add place
        </button>
      )}
      <div
        onChange={(e) => {
          if (e.target instanceof HTMLInputElement) {
            params.set("sort", e.target.id);
            params.set("page", "1");
            setParams(params);
          }
        }}
      >
        <h2>sort</h2>
        <input
          type="radio"
          name="sort"
          id="upvotes"
          defaultChecked={sort === "upvotes"}
        />
        <label htmlFor="upvotes">upvotes</label>
        <input
          type="radio"
          name="sort"
          id="downvotes"
          defaultChecked={sort === "downvotes"}
        />
        <label htmlFor="downvotes">downvotes</label>
        <input
          type="radio"
          name="sort"
          id="votes"
          defaultChecked={sort === "votes"}
        />
        <label htmlFor="votes">votes</label>
        <input
          type="radio"
          name="sort"
          id="positivity"
          defaultChecked={sort === "positivity"}
        />
        <label htmlFor="positivity">positivity</label>
        <input
          type="radio"
          name="sort"
          id="negativity"
          defaultChecked={sort === "negativity"}
        />
        <label htmlFor="negativity">negativity</label>
        <input
          type="radio"
          name="sort"
          id="last-voted"
          defaultChecked={sort === "last-voted"}
        />
        <label htmlFor="last-voted">last voted</label>
        <input
          type="radio"
          name="sort"
          id="last-added"
          defaultChecked={sort === "last-added"}
        />
        <label htmlFor="last-added">last added</label>
      </div>
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
      <button
        onClick={() => {
          params.set("page", String(page - 1));
          setParams(params);
        }}
        disabled={page <= 1}
      >
        prev
      </button>
      {/* TODO: max page */}
      <button
        onClick={() => {
          params.set("page", String(page + 1));
          setParams(params);
        }}
      >
        next
      </button>
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
