export interface Place {
  _id: string;
  country: string;
  stateOrRegion?: string;
  settlement?: string;
  name?: string;
  street?: string;
  house?: string;
  voted?: "UP" | "DOWN";
}

export function getFormattedPlace(place: Place) {
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
