import Form from "../ui/Form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../ui/InputField";
import { COUNTRIES } from "../lib/const";
import InputFieldWithSelect from "../ui/InputFieldWithSelect";
import { RefObject, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "../lib/fetch";
import { createPortal } from "react-dom";
import editPlaceSchema, { EditPlaceSchema } from "../types/editPlaceSchema";
import { Place } from "../lib/places";

export default function EditPlace({
  isCountrySelectedDefault = false,
  dialogRef,
  place,
}: {
  isCountrySelectedDefault?: boolean;
  dialogRef: RefObject<HTMLDialogElement>;
  place?: Place;
}) {
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditPlaceSchema>({ resolver: zodResolver(editPlaceSchema) });

  function localOnSuccess() {
    reset();
    setIsCountrySelected(false);
    setCountrySearch("");
  }

  const { addMutation, onAddPlace } = useAddPlace(dialogRef, localOnSuccess);

  const { editMutation, onEditPlace } = useEditPlace(
    place?._id,
    dialogRef,
    localOnSuccess
  );

  const [isCountrySelected, setIsCountrySelected] = useState(
    isCountrySelectedDefault
  );
  const [countrySearch, setCountrySearch] = useState("");

  return (
    <>
      {createPortal(
        <dialog ref={dialogRef} id="add-place">
          <Form
            mutation={place === undefined ? addMutation : editMutation}
            disabled={!isCountrySelected}
            onSubmit={
              place === undefined
                ? handleSubmit(onAddPlace)
                : handleSubmit(onEditPlace)
            }
          >
            {/* disable inputs according to switches and empty inputs */}
            <InputFieldWithSelect
              id="country"
              type="text"
              values={COUNTRIES}
              error={errors.country}
              search={countrySearch}
              setSearch={setCountrySearch}
              isSelected={isCountrySelected}
              setIsSelected={setIsCountrySelected}
              register={register}
              setValue={setValue}
              defaultValue={place?.country}
            />
            {/* TODO: search from db */}
            <InputField
              id="state-or-region"
              label="state or region"
              type="text"
              error={errors.stateOrRegion}
              {...register("stateOrRegion")}
              defaultValue={place?.stateOrRegion}
              disabled={!isCountrySelected || watch("noStateRegion")}
            />
            <InputField
              id="settlement"
              type="text"
              error={errors.settlement}
              {...register("settlement")}
              defaultValue={place?.settlement}
              disabled={!watch("stateOrRegion") || watch("noSettlement")}
            />
            <InputField
              id="name"
              type="text"
              error={errors.name}
              {...register("name")}
              defaultValue={place?.name}
              disabled={
                (!watch("settlement") &&
                  !watch("noSettlement") &&
                  (!watch("stateOrRegion") || !watch("noStateRegion"))) ||
                watch("omitName")
              }
            />
            <label htmlFor="no-state-region">not in a state/region</label>
            <input
              type="checkbox"
              id="no-state-region"
              {...register("noStateRegion")}
              defaultChecked={place && !place.stateOrRegion}
            />
            <label htmlFor="no-settlement">not in a settlement</label>
            <input
              type="checkbox"
              id="no-settlement"
              {...register("noSettlement")}
              defaultChecked={place && !place.settlement}
            />
            <InputField
              id="street"
              type="text"
              error={errors.street}
              {...register("street")}
              defaultValue={place?.street}
              disabled={!watch("name") && !watch("omitName")}
            />
            <InputField
              id="house"
              type="text"
              error={errors.house}
              {...register("house")}
              defaultValue={place?.house}
              disabled={!watch("street")}
            />
            <label htmlFor="omit-name">
              rate street, house, region or country itself (omit name)
            </label>
            <input
              type="checkbox"
              id="omit-name"
              {...register("omitName")}
              defaultChecked={place && !place.name}
            />
            {!isCountrySelected && <p>select a country</p>}
          </Form>
          <form method="dialog">
            <button type="submit">cancel</button>
          </form>
        </dialog>,
        document.body
      )}
    </>
  );
}

function useEditPlace(
  placeId: string | undefined,
  dialogRef: RefObject<HTMLDialogElement>,
  onSuccess: () => void
) {
  const onEditPlace: SubmitHandler<EditPlaceSchema> = (placeObject) => {
    editMutation.mutate(placeObject);
  };

  const queryClient = useQueryClient();

  const editMutation = useMutation({
    mutationFn: ({
      noSettlement,
      noStateRegion,
      omitName,
      settlement,
      stateOrRegion,
      name,
      ...rest
    }: EditPlaceSchema) =>
      mutateApi(
        "PATCH",
        `/places/${placeId}`,
        {
          settlement: noSettlement ? undefined : settlement,
          stateOrRegion: noStateRegion ? undefined : stateOrRegion,
          name: omitName ? undefined : name,
          ...rest,
        },
        { credentials: "include" }
      ),
    onSuccess: () => {
      dialogRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ["places"] });
      onSuccess();
    },
  });

  return { editMutation, onEditPlace };
}

function useAddPlace(
  dialogRef: RefObject<HTMLDialogElement>,
  onSuccess: () => void
) {
  const onAddPlace: SubmitHandler<EditPlaceSchema> = (placeObject) => {
    addMutation.mutate(placeObject);
  };

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({
      noSettlement,
      noStateRegion,
      omitName,
      settlement,
      stateOrRegion,
      name,
      ...rest
    }: EditPlaceSchema) =>
      mutateApi(
        "POST",
        "/places",
        {
          settlement: noSettlement ? undefined : settlement,
          stateOrRegion: noStateRegion ? undefined : stateOrRegion,
          name: omitName ? undefined : name,
          ...rest,
        },
        { credentials: "include" }
      ),
    onSuccess: () => {
      dialogRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ["places"] });
      onSuccess();
    },
  });

  return { addMutation, onAddPlace };
}
