import { parse } from "valibot";
import editPlaceSchema from "./editPlaceSchema";

const DEFAULT = {
  omitName: false,
  noSettlement: true,
  noStateRegion: true,
};
test("country and name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      name: "sinskiy",
    })
  ).toBeTruthy();
});

test("incorrect country", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "country",
      name: "sinskiy",
    })
  ).toThrow();
});

test("country", () => {
  expect(() =>
    parse(editPlaceSchema, { ...DEFAULT, country: "Russia" })
  ).toThrow();
});

test("country and omit name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      omitName: true,
    })
  ).toBeTruthy();
});

test("country, region and name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      name: "sinskiy",
    })
  ).toBeTruthy();
});

test("country, region and omit name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      omitName: true,
    })
  ).toBeTruthy();
});

test("country, region, settlement and name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      name: "sinskiy",
    })
  ).toBeTruthy();
});

test("country, region, settlement and omit name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      omitName: true,
    })
  ).toBeTruthy();
});

test("country, settlement and omit name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      settlement: "Tambov",
      noSettlement: false,
      omitName: true,
    })
  ).toThrow();
});

test("country, region, settlement, name and street", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      name: "sinskiy",
      street: "International'naya",
    })
  ).toBeTruthy();
});

test("country, region, settlement and street", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
    })
  ).toThrow();
});

test("country, region, settlement, street and omit name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
      omitName: true,
    })
  ).toBeTruthy();
});

test("country, region, settlement, street, house and name", () => {
  expect(
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
      house: "21",
      name: "sinskiy",
    })
  ).toBeTruthy();
});

test("country, street, house and name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      street: "International'naya",
      house: "21",
      name: "sinskiy",
    })
  ).toThrow();
});

test("country, street, house and omit name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      street: "International'naya",
      house: "21",
      omitName: true,
    })
  ).toThrow();
});

test("country, region, street, house and omit name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      street: "International'naya",
      house: "21",
      omitName: true,
    })
  ).toThrow();
});

test("country, settlement, street, house and omit name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
      house: "21",
      omitName: true,
    })
  ).toThrow();
});

test("country, region, settlement, house and name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      house: "21",
      name: "sinskiy",
    })
  ).toThrow();
});

test("country, region, settlement, house and omit name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      house: "21",
      omitName: true,
    })
  ).toThrow();
});

test("country, region, settlement, street and house", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
      house: "21",
    })
  ).toThrow();
});

test("country, region, settlement, street, house and omit name", () => {
  expect(() =>
    parse(editPlaceSchema, {
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
      house: "21",
      omitName: true,
    })
  ).toBeTruthy();
});
