import { ChangeEvent, RefObject, useContext, useRef, useState } from "react";
import { UserContext } from "../user";
import { createPortal } from "react-dom";
import Form from "../ui/Form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutateApi, queryApi } from "../lib/fetch";
import { infer as inferType, object, string, enum as zodEnum } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../ui/InputField";
import { getFormattedPlace, Place } from "../lib/places";
import { COUNTRIES } from "../lib/const";

export default function Home() {
  const { user } = useContext(UserContext);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const { data, isError, isLoading, error } = useQuery<Place[]>({
    queryKey: ["places", user?.id],
    queryFn: () => queryApi("/places", { credentials: "include" }),
  });

  const { isPending: isVoteLoading, error: voteError, mutate } = useVote();

  return (
    <>
      <p>
        hello, {user?.username ?? "world"}
        {user && (
          <button onClick={() => dialogRef.current?.showModal()}>
            add place
          </button>
        )}
      </p>
      {/* TODO: better loading (skeleton) and error */}
      {isLoading === true ? (
        <p>loading...</p>
      ) : isError === true ? (
        <p>{error.message}</p>
      ) : data!.length > 0 ? (
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
        voteError && <p>{voteError.message}</p>
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

let timeout: NodeJS.Timeout;
function AddPlace({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement> }) {
  const { mutation, onAddPlace } = useAddPlace(dialogRef);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPlaceSchema>({ resolver: zodResolver(addPlaceSchema) });

  const [search, setSearch] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const countries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(search.toLowerCase() ?? "")
  );

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (isSelected) {
      setIsSelected(false);
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setSearch(e.target.value);
    }, 1000);
  }

  return (
    <Form
      mutation={mutation}
      disabled={!isSelected}
      onSubmit={handleSubmit(onAddPlace)}
    >
      {/* TODO: search from countries list */}
      <InputField
        id="country"
        type="text"
        error={errors.country}
        {...register("country", { onChange: handleChange })}
      />
      {search && (
        <ul>
          {/* no search: hidden, search: result */}
          {countries.map((country) => (
            <li key={country}>
              <button
                onClick={() => {
                  setValue("country", country);
                  setSearch(country);
                  setIsSelected(true);
                }}
                type="button"
              >
                {country}
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* TODO: search from db */}
      <InputField
        id="state-or-region"
        label="state or region"
        type="text"
        error={errors.stateOrRegion}
        {...register("stateOrRegion")}
      />
      <InputField
        id="settlement"
        type="text"
        error={errors.settlement}
        {...register("settlement")}
      />
      <InputField
        id="name"
        type="text"
        error={errors.name}
        {...register("name")}
      />
      <InputField
        id="street"
        type="text"
        error={errors.street}
        {...register("street")}
      />
      <InputField
        id="house"
        type="text"
        error={errors.house}
        {...register("house")}
      />
      {!isSelected && <p>select a country</p>}
    </Form>
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

function useAddPlace(dialogRef: RefObject<HTMLDialogElement>) {
  const onAddPlace: SubmitHandler<AddPlaceSchema> = (placeObject) => {
    mutation.mutate(placeObject);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (placeObject: AddPlaceSchema) =>
      mutateApi("POST", "/places", placeObject, { credentials: "include" }),
    onSuccess: () => {
      dialogRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  return { mutation, onAddPlace };
}

const addPlaceSchema = object({
  country: zodEnum(COUNTRIES, {
    errorMap: () => ({ message: "Invalid country" }),
  }),
  stateOrRegion: string().optional(),
  settlement: string().optional(),
  name: string().optional(),

  street: string().optional(),
  house: string().optional(),
}).refine(
  ({ stateOrRegion, settlement, street, house, name }) => {
    let settlementIsFine = true,
      streetIsFine = true,
      houseIsFine = true;
    if (settlement) {
      settlementIsFine = !!stateOrRegion;
    }
    if (street) {
      streetIsFine = !!settlement && !!name;
    }
    if (house) {
      houseIsFine = !!street && !!name;
    }
    return settlementIsFine && streetIsFine && houseIsFine;
  },
  { message: "Data must be gradual", path: ["house"] }
);

type AddPlaceSchema = inferType<typeof addPlaceSchema>;
