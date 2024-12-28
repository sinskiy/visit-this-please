import { RefObject, useContext, useRef } from "react";
import { UserContext } from "../user";
import { createPortal } from "react-dom";
import Form from "../ui/Form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "../lib/fetch";
import { infer as inferType, object, string } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../ui/InputField";

export default function Home() {
  const { user } = useContext(UserContext);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const { mutation, onAddPlace } = useAddPlace(dialogRef);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPlaceSchema>({ resolver: zodResolver(addPlaceSchema) });

  return (
    <p>
      hello, {user?.username ?? "world"}
      {user && (
        <button onClick={() => dialogRef.current?.showModal()}>
          add place
        </button>
      )}
      {createPortal(
        <dialog ref={dialogRef} id="add-place">
          <Form mutation={mutation} onSubmit={handleSubmit(onAddPlace)}>
            {/* TODO: search from countries list */}
            <InputField
              id="country"
              type="text"
              error={errors.country}
              {...register("country")}
            />
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
          </Form>
          <form method="dialog">
            <button type="submit">cancel</button>
          </form>
        </dialog>,
        document.body
      )}
    </p>
  );
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

// TODO: if (city) typeof stateOrRegion === "string", etc.
// TODO: "not in a settlement" switch
// TODO: "rate the street itself" and "rate the house itself" switch
const addPlaceSchema = object({
  country: string().min(1).max(50),
  stateOrRegion: string().optional(),
  settlement: string().optional(),
  name: string().optional(),

  street: string().optional(),
  house: string().optional(),
});

type AddPlaceSchema = inferType<typeof addPlaceSchema>;
