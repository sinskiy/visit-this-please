import { Router } from "express";
import { ErrorWithStatus } from "./lib/error.ts";
import { object, string, enum as zodEnum } from "zod";
import { isUser } from "./auth/controllers.ts";
import { Place } from "./db/config.ts";
import { COUNTRIES } from "./lib/const.ts";
import { Types } from "mongoose";

const router = Router();

const addPlaceSchema = object({
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

router.get("/", async (req, res) => {
  const { sort = "positivity", page = 1, search = "" } = req.query;

  if (typeof search !== "string") {
    throw new ErrorWithStatus("Search type is invalid", 400);
  }

  const filter = search.length > 0 ? { $text: { $search: search } } : {};
  const places = await Place.find(filter, { votes: { text: 0 } });
  switch (sort) {
    case "votes":
      places.sort((a, b) => b.votes.length - a.votes.length);
      break;
    case "upvotes":
      places.sort(
        (a, b) =>
          b.votes.filter((vote) => vote.type === "UP").length -
          a.votes.filter((vote) => vote.type === "UP").length
      );
      break;
    case "downvotes":
      places.sort(
        (a, b) =>
          b.votes.filter((vote) => vote.type === "DOWN").length -
          a.votes.filter((vote) => vote.type === "DOWN").length
      );
      break;
    case "positivity":
      places.sort(
        (a, b) =>
          b.votes.filter((vote) => vote.type === "UP").length -
          b.votes.filter((vote) => vote.type === "DOWN").length -
          (a.votes.filter((vote) => vote.type === "UP").length -
            a.votes.filter((vote) => vote.type === "DOWN").length)
      );
      break;
    case "negativity":
      places.sort(
        (a, b) =>
          a.votes.filter((vote) => vote.type === "UP").length -
          a.votes.filter((vote) => vote.type === "DOWN").length -
          (b.votes.filter((vote) => vote.type === "UP").length -
            b.votes.filter((vote) => vote.type === "DOWN").length)
      );
      break;
    case "last-voted":
      places.sort(
        (a, b) =>
          Math.max(
            ...b.votes.map((vote) => vote._id.getTimestamp().getTime())
          ) -
          Math.max(...a.votes.map((vote) => vote._id.getTimestamp().getTime()))
      );
      break;
    case "last-added":
      places.sort(
        (a, b) =>
          b._id.getTimestamp().getTime() - a._id.getTimestamp().getTime()
      );
  }

  const PAGE_LENGTH = 5;
  res.json(
    places
      .slice(
        Number(page) * PAGE_LENGTH - PAGE_LENGTH,
        Number(page) * PAGE_LENGTH
      )
      .map((place) => getPlaceWithVotes(place, req.user?.id))
  );
});

router.post("/", isUser, async (req, res) => {
  const parsedSchema = addPlaceSchema.safeParse(req.body);

  if (!parsedSchema.success) {
    throw new ErrorWithStatus("Incorrect data", 400);
  }

  const [place] = await Place.insertMany([
    { ...parsedSchema.data, userId: req.user!.id },
  ]);

  if (!place) {
    throw new Error();
  }

  res.json({ status: "success" });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const place = await Place.findById(id);
  if (!place) {
    throw new ErrorWithStatus("Place not found", 404);
  }

  res.json(getPlaceWithVotes(place, req.user?.id, true));
});

router.patch("/:id/votes", isUser, async (req, res) => {
  const { id } = req.params;

  if (!req.body.type) {
    throw new ErrorWithStatus("No type", 400);
  }

  const place = await Place.findById(id);

  if (!place) {
    throw new Error();
  }

  let voted = false;
  place.votes.map((vote) => {
    if (vote.userId.toString() === req.user?.id) {
      voted = true;
      vote.type = req.body.type;
    }
    return vote;
  });
  if (!voted) {
    place.votes.push({ type: req.body.type, userId: req.user!.id });
  }

  await place.save();

  res.json({ status: "success" });
});

router.patch("/:id/votes/:voteId", isUser, async (req, res) => {
  if (!req.body.text) {
    throw new ErrorWithStatus("No text", 400);
  }

  const { id, voteId } = req.params;

  // const place = await Place.findOneAndUpdate(
  //   { _id: id, "votes.id": voteId },
  //   { $set: { "votes.$.text": req.body.text } }
  // );
  const place = await Place.findById(id);
  const vote = place && place.votes.id(voteId);
  if (vote) {
    vote.text = req.body.text;
    await place.save();
  }
  res.json({ status: "success" });
});

export default router;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getPlace() {
  return await Place.findOne();
}

function getPlaceWithVotes(
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
  };
}

type VoteType = "UP" | "DOWN";

interface Vote {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: VoteType;
  text?: string;
}
