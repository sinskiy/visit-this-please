import Form from "@/ui/Form";
import { SubmitHandler, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import InputField from "@/ui/InputField";
import { COUNTRIES } from "@/lib/const";
import InputFieldWithSelect from "@/ui/InputFieldWithSelect";
import { RefObject, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "@/lib/fetch";
import { createPortal } from "react-dom";
import editPlaceSchema, { EditPlaceSchema } from "@/types/editPlaceSchema";
import { Place } from "@/lib/places";
import CheckboxField from "@/ui/CheckboxField";
import styled from "styled-components";

const DialogForm = styled.form`
  margin-top: 2rem;
`;

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
  } = useForm<EditPlaceSchema>({ resolver: valibotResolver(editPlaceSchema) });

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
            name={place === undefined ? "add place" : "edit place"}
          >
            {/* disable inputs according to switches and empty inputs */}
            <InputFieldWithSelect
              id="country"
              label={
                <>
                  country<span className="error-text">*</span>
                </>
              }
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
              label={
                <>
                  name<span className="error-text">*</span>
                </>
              }
              type="text"
              error={errors.name}
              {...register("name")}
              defaultValue={place?.name}
              disabled={
                watch("omitName") ||
                (!watch("settlement") && !watch("noSettlement")) ||
                (watch("noSettlement") &&
                  !watch("stateOrRegion") &&
                  !watch("noStateRegion"))
              }
            />
            <fieldset>
              <CheckboxField
                type="checkbox"
                id="no-state-region"
                label="not in a state/region"
                {...register("noStateRegion")}
                defaultChecked={place && !place.stateOrRegion}
              />
              <CheckboxField
                type="checkbox"
                id="no-settlement"
                label="not in a settlement"
                {...register("noSettlement")}
                defaultChecked={place && !place.settlement}
                disabled={!watch("stateOrRegion") && !watch("noStateRegion")}
              />
            </fieldset>
            <InputField
              id="street"
              type="text"
              error={errors.street}
              {...register("street")}
              defaultValue={place?.street}
              disabled={
                (!watch("name") && !watch("omitName")) ||
                (watch("omitName") && !watch("settlement"))
              }
            />
            <InputField
              id="house"
              type="text"
              error={errors.house}
              {...register("house")}
              defaultValue={place?.house}
              disabled={!watch("street")}
            />
            <CheckboxField
              type="checkbox"
              id="omit-name"
              label="rate street, house, region or country itself (omit name)"
              {...register("omitName")}
              defaultChecked={place && !place.name}
            />
            {!isCountrySelected && (
              <p className="error-text">select a country</p>
            )}
          </Form>
          <DialogForm method="dialog">
            <button type="submit">exit</button>
          </DialogForm>
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
