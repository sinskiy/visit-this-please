import { Router } from "express";
import { ErrorWithStatus } from "../lib/error.ts";
import { Place } from "../db/config.ts";
import { getPlaceWithVotes } from "./controllers.ts";
import { isUser } from "../auth/controllers.ts";
import { addPlaceSchema } from "./types.ts";

const router = Router();

router.get("/", async (req, res) => {
  const {
    sort = "positive",
    page = 1,
    search = "",
    filter = "none",
  } = req.query;

  if (typeof search !== "string") {
    throw new ErrorWithStatus("Search type is invalid", 400);
  }

  const placeFilter = search.length > 0 ? { $text: { $search: search } } : {};
  let places = await Place.find(placeFilter);
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
    case "positive":
      places.sort(
        (a, b) =>
          b.votes.filter((vote) => vote.type === "UP").length -
          b.votes.filter((vote) => vote.type === "DOWN").length -
          (a.votes.filter((vote) => vote.type === "UP").length -
            a.votes.filter((vote) => vote.type === "DOWN").length)
      );
      break;
    case "positive-to-negative":
      places.sort(
        (a, b) =>
          b.votes.filter((vote) => vote.type === "UP").length /
            b.votes.filter((vote) => vote.type === "DOWN").length -
          a.votes.filter((vote) => vote.type === "UP").length /
            a.votes.filter((vote) => vote.type === "DOWN").length
      );
      break;
    case "negative":
      places.sort(
        (a, b) =>
          a.votes.filter((vote) => vote.type === "UP").length -
          a.votes.filter((vote) => vote.type === "DOWN").length -
          (b.votes.filter((vote) => vote.type === "UP").length -
            b.votes.filter((vote) => vote.type === "DOWN").length)
      );
      break;
    case "negative-to-positive":
      places.sort(
        (a, b) =>
          b.votes.filter((vote) => vote.type === "DOWN").length /
            b.votes.filter((vote) => vote.type === "UP").length -
          a.votes.filter((vote) => vote.type === "DOWN").length /
            a.votes.filter((vote) => vote.type === "UP").length
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
      break;
    case "comments":
      places.sort(
        (a, b) =>
          b.votes.filter((vote) => typeof vote.text === "string").length -
          a.votes.filter((vote) => typeof vote.text === "string").length
      );
  }

  switch (filter) {
    case "voted-by-me":
      places = places.filter(
        (place) =>
          place.votes.findIndex(
            (vote) => vote.userId.toString() === req.user?.id
          ) !== -1
      );
      break;
    case "commented-by-me":
      places = places.filter(
        (place) =>
          place.votes.findIndex(
            (vote) => vote.userId.toString() === req.user?.id && vote.text
          ) !== -1
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

  const { sort = "last-added" } = req.query;

  switch (sort) {
    case "likes":
      place.votes.sort((a, b) => b.likes.length - a.likes.length);
      break;
    case "last-added":
      place.votes.sort(
        (a, b) =>
          b._id.getTimestamp().getTime() - a._id.getTimestamp().getTime()
      );
      break;
    case "upvotes-first":
      place.votes.sort((a) => (a.type === "UP" ? -1 : 1));
      break;
    case "downvotes-first":
      place.votes.sort((a) => (a.type === "UP" ? 1 : -1));
  }

  res.json(getPlaceWithVotes(place, req.user?.id, true));
});
router.delete("/:id", isUser, async (req, res) => {
  const { id } = req.params;

  const place = await Place.findById(id);
  if (!place) {
    throw new ErrorWithStatus("Place not found", 404);
  }
  if (
    place.votes.length > 1 ||
    (place.votes.length === 1 &&
      place.votes[0]?.userId.toString() !== req.user?.id)
  ) {
    throw new ErrorWithStatus("You're not the author", 403);
  }

  await place.deleteOne();

  res.json({ status: "success" });
});
router.patch("/:id", isUser, async (req, res) => {
  const parsedSchema = addPlaceSchema.safeParse(req.body);

  if (!parsedSchema.success) {
    throw new ErrorWithStatus("Incorrect data", 400);
  }

  const { id } = req.params;

  const place = await Place.findById(id);
  if (!place) {
    throw new ErrorWithStatus("Place not found", 404);
  }
  if (
    place.votes.length > 1 ||
    (place.votes.length === 1 && place.votes[0]?.userId !== req.user?.id)
  ) {
    throw new ErrorWithStatus("You're not the author", 403);
  }

  await place.updateOne({ ...parsedSchema.data });

  res.json({ status: "success" });
});

router.patch("/:id/votes", isUser, async (req, res) => {
  const { id } = req.params;

  if (!req.body.type && req.body.type !== null) {
    throw new ErrorWithStatus("No type", 400);
  }

  const place = await Place.findById(id);

  if (!place) {
    throw new Error();
  }

  let voted = false;
  place.votes.forEach((vote) => {
    if (vote.userId.toString() === req.user?.id) {
      voted = true;
      if (req.body.type === null) {
        vote.deleteOne();
      } else {
        vote.type = req.body.type;
      }
    }
  });

  if (!voted && req.body.type !== null) {
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
  if (!vote) {
    throw new Error();
  }
  if (vote.userId.toString() !== req.user!.id) {
    throw new ErrorWithStatus("Not your vote", 403);
  }
  vote.text = req.body.text || null;

  await place.save();

  res.json({ status: "success" });
});

router.patch("/:id/votes/:voteId/likes", isUser, async (req, res) => {
  const { id, voteId } = req.params;

  const place = await Place.findById(id);

  const vote = place && place.votes.id(voteId);
  if (!vote) {
    throw new Error();
  }
  const like = vote.likes.find(
    (like) => like.userId.toString() === req.user!.id
  );
  if (like) {
    like.deleteOne();
  } else {
    vote.likes.push({ userId: req.user!.id });
  }
  await place.save();

  res.json({ status: "success" });
});

router.post("/:id/votes/:voteId/replies", isUser, async (req, res) => {
  if (!req.body.text) {
    throw new ErrorWithStatus("No text", 400);
  }

  const { id, voteId } = req.params;

  const place = await Place.findById(id);

  const vote = place && place.votes.id(voteId);
  if (!vote) {
    throw new Error();
  }

  vote.replies.push({
    userId: req.user!.id,
    text: req.body.text,
    replyId: req.body.replyId,
    replyUserId: req.body.replyUserId,
  });

  await place.save();

  res.json({ status: "success" });
});
router.delete(
  "/:id/votes/:voteId/replies/:replyId",
  isUser,
  async (req, res) => {
    const { id, voteId, replyId } = req.params;

    const place = await Place.findById(id);

    const vote = place && place.votes.id(voteId);

    const reply = vote && vote.replies.id(replyId);
    if (!reply) {
      throw new Error();
    }
    if (reply.userId.toString() !== req.user!.id) {
      throw new ErrorWithStatus("You're not the author", 403);
    }

    reply.deleteOne();

    await place.save();

    res.json({ status: "success" });
  }
);

export default router;
