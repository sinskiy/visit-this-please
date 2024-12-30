import { Router } from "express";
import { ErrorWithStatus } from "../lib/error.ts";
import { Place } from "../db/config.ts";
import { getPlaceWithVotes } from "./controllers.ts";
import { isUser } from "../auth/controllers.ts";
import { addPlaceSchema } from "./types.ts";

const router = Router();

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
  if (typeof req.body.text !== "string") {
    throw new ErrorWithStatus("No text", 400);
  }

  const { id, voteId } = req.params;

  const place = await Place.findById(id);
  const vote = place && place.votes.id(voteId);
  if (vote) {
    vote.text = req.body.text;
    await place.save();
  }
  res.json({ status: "success" });
});

export default router;
