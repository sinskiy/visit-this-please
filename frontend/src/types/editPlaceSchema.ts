import {
  boolean,
  InferOutput,
  object,
  string,
  pipe,
  optional,
  picklist,
  check,
  forward,
} from "valibot";
import { COUNTRIES } from "../lib/const";

const editPlaceSchema = pipe(
  object({
    country: picklist(COUNTRIES),
    stateOrRegion: optional(string()),
    settlement: optional(string()),
    name: optional(string()),

    street: optional(string()),
    house: optional(string()),
    noSettlement: boolean(),
    noStateRegion: boolean(),
    omitName: boolean(),
  }),
  forward(
    check(
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
      "Data must be gradual"
    ),
    ["house"]
  )
);

export default editPlaceSchema;

export type EditPlaceSchema = InferOutput<typeof editPlaceSchema>;
