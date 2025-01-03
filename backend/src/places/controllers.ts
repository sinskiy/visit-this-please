import { Place } from "../db/config.ts";
import type { Vote, VoteType } from "./types.ts";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getPlace() {
  return await Place.findOne();
}

export function getPlaceWithVotes(
  place: Awaited<ReturnType<typeof getPlace>>,
  reqUserId?: string,
  extended: boolean = false
) {
  let voted: VoteType | undefined;
  let userVote: Vote | undefined;
  let up = 0;
  let down = 0;

  for (const vote of place!.votes) {
    if (vote.userId.toString() === reqUserId) {
      voted = vote.type;
      if (extended === true) {
        userVote = vote;
      }
    }

    switch (vote.type) {
      case "UP":
        up++;
        break;
      case "DOWN":
        down++;
    }
  }

  const {
    _id,
    userId,
    country,
    stateOrRegion,
    settlement,
    name,
    street,
    house,
    votes,
  } = place!;

  return {
    _id,
    userId: extended ? undefined : userId,
    country,
    stateOrRegion,
    settlement,
    name,
    street,
    house,
    voted,
    up,
    down,
    userVote: extended ? userVote : undefined,
    votes: extended ? votes : undefined,
    votesLength: extended ? undefined : votes.length,
  };
}
