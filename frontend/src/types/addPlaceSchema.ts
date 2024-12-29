import {
  boolean,
  infer as inferType,
  object,
  string,
  enum as zodEnum,
} from "zod";
import { COUNTRIES } from "../lib/const";

const addPlaceSchema = object({
  country: zodEnum(COUNTRIES, {
    errorMap: () => ({ message: "Invalid country" }),
  }),
  stateOrRegion: string().optional(),
  settlement: string().optional(),
  name: string().optional(),

  street: string().optional(),
  house: string().optional(),
  noSettlement: boolean(),
  noStateRegion: boolean(),
  omitName: boolean(),
}).refine(
  ({
    stateOrRegion,
    settlement,
    street,
    house,
    name,
    noSettlement,
    noStateRegion,
    omitName,
  }) => {
    let settlementIsFine = true,
      streetIsFine = true,
      nameIsFine = true,
      houseIsFine = true;
    if (settlement) {
      settlementIsFine = !!stateOrRegion;
    }

    nameIsFine =
      (!!settlement && !!stateOrRegion) ||
      (noSettlement && !!stateOrRegion) ||
      (noSettlement && noStateRegion);
    nameIsFine &&= !!name || omitName;

    if (street) {
      streetIsFine = !!settlement && (!!name || omitName);
    }
    if (house) {
      houseIsFine = !!street && (!!name || omitName);
    }
    return settlementIsFine && nameIsFine && streetIsFine && houseIsFine;
  },
  { message: "Data must be gradual", path: ["house"] }
);

export default addPlaceSchema;

export type AddPlaceSchema = inferType<typeof addPlaceSchema>;
