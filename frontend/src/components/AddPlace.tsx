import Form from "../ui/Form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../ui/InputField";
import { COUNTRIES } from "../lib/const";
import InputFieldWithSelect from "../ui/InputFieldWithSelect";
import { RefObject, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "../lib/fetch";
import addPlaceSchema, { AddPlaceSchema } from "../types/addPlaceSchema";

export default function AddPlace({
  dialogRef,
}: {
  dialogRef: RefObject<HTMLDialogElement>;
}) {
  const { mutation, onAddPlace } = useAddPlace(dialogRef);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPlaceSchema>({ resolver: zodResolver(addPlaceSchema) });

  const [isSelected, setIsSelected] = useState(false);

  return (
    <Form
      mutation={mutation}
      disabled={!isSelected}
      onSubmit={handleSubmit(onAddPlace)}
    >
      {/* disable inputs according to switches and empty inputs */}
      <InputFieldWithSelect
        id="country"
        values={COUNTRIES}
        error={errors.country}
        isSelected={isSelected}
        setIsSelected={setIsSelected}
        register={register}
        setValue={setValue}
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
      <label htmlFor="no-state-region">not in a state/region</label>
      <input
        type="checkbox"
        id="no-state-region"
        {...register("noStateRegion")}
      />
      <label htmlFor="no-settlement">not in a settlement</label>
      <input type="checkbox" id="no-settlement" {...register("noSettlement")} />
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
      <label htmlFor="omit-name">
        rate street, house, region or country itself (omit name)
      </label>
      <input type="checkbox" id="omit-name" {...register("omitName")} />
      {!isSelected && <p>select a country</p>}
    </Form>
  );
}

function useAddPlace(dialogRef: RefObject<HTMLDialogElement>) {
  const onAddPlace: SubmitHandler<AddPlaceSchema> = (placeObject) => {
    mutation.mutate(placeObject);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      noSettlement,
      noStateRegion,
      settlement,
      stateOrRegion,
      ...rest
    }: AddPlaceSchema) =>
      mutateApi(
        "POST",
        "/places",
        {
          settlement: noSettlement ? undefined : settlement,
          stateOrRegion: noStateRegion ? undefined : stateOrRegion,
          ...rest,
        },
        { credentials: "include" }
      ),
    onSuccess: () => {
      dialogRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  return { mutation, onAddPlace };
}
