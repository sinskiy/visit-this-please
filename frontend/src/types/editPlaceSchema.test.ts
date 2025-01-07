import editPlaceSchema from "./editPlaceSchema";

const DEFAULT = {
  omitName: false,
  noSettlement: true,
  noStateRegion: true,
};
test("country and name", () => {
  expect(
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      name: "sinskiy",
    })
  ).toBeTruthy();
});

test("incorrect country", () => {
  expect(() =>
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "country",
      name: "sinskiy",
    })
  ).toThrowError();
});

test("country", () => {
  expect(() =>
    editPlaceSchema.parse({ ...DEFAULT, country: "Russia" })
  ).toThrowError();
});

test("country and omit name", () => {
  expect(
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      omitName: true,
    })
  ).toBeTruthy();
});

test("country, region and name", () => {
  expect(
    editPlaceSchema.parse({
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
    editPlaceSchema.parse({
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
    editPlaceSchema.parse({
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
    editPlaceSchema.parse({
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
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      settlement: "Tambov",
      noSettlement: false,
      omitName: true,
    })
  ).toThrowError();
});

test("country, region, settlement, name and street", () => {
  expect(
    editPlaceSchema.parse({
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
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
    })
  ).toThrowError();
});

test("country, region, settlement, street and omit name", () => {
  expect(
    editPlaceSchema.parse({
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
    editPlaceSchema.parse({
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
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      street: "International'naya",
      house: "21",
      name: "sinskiy",
    })
  ).toThrowError();
});

test("country, street, house and omit name", () => {
  expect(() =>
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      street: "International'naya",
      house: "21",
      omitName: true,
    })
  ).toThrowError();
});

test("country, region, street, house and omit name", () => {
  expect(() =>
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      street: "International'naya",
      house: "21",
      omitName: true,
    })
  ).toThrowError();
});

test("country, settlement, street, house and omit name", () => {
  expect(() =>
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
      house: "21",
      omitName: true,
    })
  ).toThrowError();
});

test("country, region, settlement, house and name", () => {
  expect(() =>
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      house: "21",
      name: "sinskiy",
    })
  ).toThrowError();
});

test("country, region, settlement, house and omit name", () => {
  expect(() =>
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      house: "21",
      omitName: true,
    })
  ).toThrowError();
});

test("country, region, settlement, street and house", () => {
  expect(() =>
    editPlaceSchema.parse({
      ...DEFAULT,
      country: "Russia",
      stateOrRegion: "Tambov oblast'",
      noStateRegion: false,
      settlement: "Tambov",
      noSettlement: false,
      street: "International'naya",
      house: "21",
    })
  ).toThrowError();
});

test("country, region, settlement, street, house and omit name", () => {
  expect(() =>
    editPlaceSchema.parse({
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
