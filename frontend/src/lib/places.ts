import { Vote, VoteType } from "./votes";

interface PlaceBase {
  _id: string;
  country: string;
  stateOrRegion?: string;
  settlement?: string;
  name?: string;
  street?: string;
  house?: string;
  voted?: VoteType;
  up: number;
  down: number;
}

export interface Place extends PlaceBase {
  userId: string;
  votesLength: number;
}

export interface PlaceById extends PlaceBase {
  userVote?: Vote;
  votes: Vote[];
}

export function getFormattedPlace(place: Partial<Place>) {
  let formattedPlace = "";
  formattedPlace = extendFormattedPlace(formattedPlace, place.name);
  formattedPlace = extendFormattedPlace(formattedPlace, place.house);
  formattedPlace = extendFormattedPlace(formattedPlace, place.street);
  formattedPlace = extendFormattedPlace(formattedPlace, place.settlement);
  formattedPlace = extendFormattedPlace(formattedPlace, place.stateOrRegion);
  formattedPlace = extendFormattedPlace(formattedPlace, place.country);
  // remove last ", "
  return formattedPlace.slice(0, -2);
}

function extendFormattedPlace(place: string, value?: string) {
  if (value) {
    place += `${value}, `;
  }
  return place;
}
