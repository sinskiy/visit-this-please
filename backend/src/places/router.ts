import { Router } from "express";
import { ErrorWithStatus } from "../lib/error.ts";
import { object, string } from "zod";
import { isUser } from "../auth/controllers.ts";
import { Place } from "../db/config.ts";

const router = Router();

// TODO: if (city) typeof stateOrRegion === "string", etc.
// TODO: "not in a settlement" switch
// TODO: "rate the street itself" and "rate the house itself" switch
const addPlaceSchema = object({
  country: string().min(1).max(50),
  stateOrRegion: string().optional(),
  settlement: string().optional(),
  name: string().optional(),

  street: string().optional(),
  house: string().optional(),
});

router.get("/", async (_req, res) => {
  const places = await Place.find();

  res.json(places);
});

router.post("/", isUser, async (req, res) => {
  // TODO: abstract the validation
  if (!req.body?.country) {
    throw new ErrorWithStatus("No country", 400);
  }

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

  res.json({
    country: place.country,
    stateOrRegion: place.stateOrRegion,
    settlement: place.settlement,
    name: place.name,
    street: place.street,
    house: place.house,
  });
});

export default router;
