import { object, string, enum as zodEnum } from "zod";
import { Types } from "mongoose";
import { COUNTRIES } from "../lib/const.ts";

export const addPlaceSchema = object({
  country: zodEnum(COUNTRIES, { description: "Invalid country" }),
  stateOrRegion: string().optional(),
  settlement: string().optional(),
  name: string().optional(),

  street: string().optional(),
  house: string().optional(),
}).refine(({ stateOrRegion, settlement, street, house }) => {
  let settlementIsFine = true,
    streetIsFine = true,
    houseIsFine = true;
  if (settlement) {
    settlementIsFine = !!stateOrRegion;
  }
  if (street) {
    streetIsFine = !!settlement;
  }
  if (house) {
    houseIsFine = !!street;
  }
  return settlementIsFine && streetIsFine && houseIsFine;
});

export type VoteType = "UP" | "DOWN";

export interface Vote {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: VoteType;
  text?: string;
}
