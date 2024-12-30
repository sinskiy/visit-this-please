import { getFormattedPlace, type Place } from "../lib/places";
import { useContext } from "react";
import { UserContext } from "../user";
import { useVote } from "../lib/votes";

export default function Place({ place }: { place: Place }) {
  return (
    <>
      <p>{getFormattedPlace(place)}</p>
      <Votes place={place} />
    </>
  );
}

function Votes({ place }: { place: Place }) {
  const { isPending: isVoteLoading, mutate } = useVote();
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
