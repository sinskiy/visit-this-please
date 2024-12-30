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
  const sort = params.get("sort") ?? "positivity";
  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") ?? "";

  function setSearch(search?: string) {
    params.set("search", search ?? "");
    setParams(params);
  }
  function setSort(type: string) {
    params.set("sort", type);
    params.set("page", "1");
    setParams(params);
  }
  function setPrevPage() {
    params.set("page", String(page - 1));
    setParams(params);
  }
  function setNextPage() {
    params.set("page", String(page + 1));
    setParams(params);
  }

  const dialogRef = useRef<HTMLDialogElement>(null);

  const { data, isLoading, isError, error } = usePlaces({ sort, page, search });

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
      <Search setSearch={setSearch} />
      <Sort sort={sort} setSort={setSort} />
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
      <Pagination
        page={page}
        setPrevPage={setPrevPage}
        setNextPage={setNextPage}
      />
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

function Search({ setSearch }: { setSearch: (search?: string) => void }) {
  const searchRef = useRef<HTMLInputElement>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSearch(searchRef.current?.value);
      }}
    >
      <input type="search" name="search" id="search" ref={searchRef} />
      <button type="submit">submit</button>
    </form>
  );
}

function Sort({
  sort,
  setSort,
}: {
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
      <option value="upvotes">upvotes</option>
      <option value="downvotes">downvotes</option>
      <option value="votes">votes</option>
      <option value="positivity">positivity</option>
      <option value="negativity">negativity</option>
      <option value="last-added">last added</option>
      <option value="last-voted">last voted</option>
    </select>
  );
}

function Pagination({
  page,
  setPrevPage,
  setNextPage,
}: {
  page: number;
  setPrevPage: () => void;
  setNextPage: () => void;
}) {
  return (
    <>
      <button onClick={setPrevPage} disabled={page <= 1}>
        prev
      </button>
      {/* TODO: max page */}
      <button onClick={setNextPage}>next</button>
    </>
  );
}

function usePlaces({
  sort,
  page,
  search,
}: {
  sort: string;
  page: number;
  search: string;
}) {
  const query = useQuery<Place[]>({
    queryKey: ["places", sort, page, search],
    queryFn: () =>
      queryApi(`/places?sort=${sort}&page=${page}&search=${search}`, {
        credentials: "include",
      }),
  });

  return query;
}
