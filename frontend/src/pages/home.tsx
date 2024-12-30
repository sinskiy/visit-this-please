import { useContext, useRef } from "react";
import { UserContext } from "../user";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { queryApi } from "../lib/fetch";
import { Place as PlaceI } from "../lib/places";
import AddPlace from "../components/AddPlace";
import { Link, useSearchParams } from "react-router";
import { useVote } from "../lib/votes";
import Place from "../components/Place";

const SORT_OPTIONS = [
  "upvotes",
  "downvotes",
  "votes",
  "positivity",
  "negativity",
  "last-voted",
  "last-added",
  "comments",
];
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
      <Sort types={SORT_OPTIONS} sort={sort} setSort={setSort} />
      {/* TODO: better loading (skeleton) */}
      {isLoading === true ? (
        <p>loading...</p>
      ) : isError || !data ? (
        <p>{error?.message || "Unexpected error"}</p>
      ) : data.length > 0 ? (
        <ul>
          {data!.map((place) => (
            <li key={place._id}>
              <Place place={place} />
              <Link to={`/${place._id}`}>comments</Link>
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
  const query = useQuery<PlaceI[]>({
    queryKey: ["places", { sort, page, search }],
    queryFn: () =>
      queryApi(`/places?sort=${sort}&page=${page}&search=${search}`, {
        credentials: "include",
      }),
  });

  return query;
}
