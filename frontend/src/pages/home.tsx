import { useContext, useRef } from "react";
import { UserContext } from "../user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryApi } from "../lib/fetch";
import { Place as PlaceI } from "../lib/places";
import EditPlace from "../components/EditPlace";
import { Link, useSearchParams } from "react-router";
import { useVote } from "../lib/votes";
import Place from "../components/Place";
import Sort from "../components/SortOrFilter";
const Filter = Sort;

const PAGE_LENGTH = 5;

const SORT_OPTIONS = [
  "upvotes",
  "downvotes",
  "votes",
  "positive",
  "positive-to-negative",
  "negative",
  "negative-to-positive",
  "last-voted",
  "last-added",
  "comments",
];
const FILTER_OPTIONS = ["none", "voted-by-me", "commented-by-me"];
export default function Home() {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  const [params, setParams] = useSearchParams();
  const sort = params.get("sort") ?? "positive";
  const filter = params.get("filter") ?? "none";
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
  function setFilter(type: string) {
    params.set("filter", type);
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

  const { data, isLoading, isError, error } = usePlaces({
    sort,
    filter,
    page,
    search,
  });

  const {
    isPending: isVoteLoading,
    isError: isVoteError,
    error: voteError,
  } = useVote();

  function prefetchPlace(id: string) {
    queryClient.prefetchQuery({
      queryKey: ["places", id, { sort: "last-added" }],
      queryFn: () =>
        queryApi(`/places/${id}`, {
          credentials: "include",
        }),
    });
  }

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
      <Sort types={SORT_OPTIONS} value={sort} setValue={setSort} isSort />
      <Filter
        types={FILTER_OPTIONS}
        value={filter}
        setValue={setFilter}
        isSort={false}
      />
      {/* TODO: better loading (skeleton) */}
      {isLoading === true ? (
        <p>loading...</p>
      ) : isError || !data ? (
        <p>{error?.message || "Unexpected error"}</p>
      ) : data.length > 0 ? (
        <ul>
          {data!.map((place) => (
            <li
              key={place._id}
              onFocus={() => prefetchPlace(place._id)}
              onMouseEnter={() => prefetchPlace(place._id)}
            >
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
        lastPage={!data || data.length !== PAGE_LENGTH}
      />
      {isVoteLoading ? (
        <p>voting...</p>
      ) : (
        isVoteError && <p>{voteError.message}</p>
      )}
      <EditPlace dialogRef={dialogRef} />
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

function Pagination({
  page,
  setPrevPage,
  setNextPage,
  lastPage,
}: {
  page: number;
  setPrevPage: () => void;
  setNextPage: () => void;
  lastPage: boolean;
}) {
  return (
    <>
      <button onClick={setPrevPage} disabled={page <= 1}>
        prev
      </button>
      {/* TODO: max page */}
      <button onClick={setNextPage} disabled={lastPage}>
        next
      </button>
    </>
  );
}

function usePlaces({
  sort,
  filter,
  page,
  search,
}: {
  sort: string;
  filter: string;
  page: number;
  search: string;
}) {
  const query = useQuery<PlaceI[]>({
    queryKey: ["places", { sort, filter, page, search }],
    queryFn: () =>
      queryApi(
        `/places?sort=${sort}&filter=${filter}&page=${page}&search=${search}`,
        {
          credentials: "include",
        }
      ),
  });

  return query;
}
