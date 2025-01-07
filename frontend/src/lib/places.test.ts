import { getFormattedPlace } from "@/lib/places";

describe("getFormattedPlace", () => {
  test("gradual place is returned correctly", () => {
    expect(getFormattedPlace({ _id: "", country: "country" })).toBe("country");

    expect(
      getFormattedPlace({
        _id: "",
        country: "country",
        stateOrRegion: "region",
        settlement: "settlement",
        street: "street",
        house: "house",
      })
    ).toBe("house, street, settlement, region, country");

    expect(
      getFormattedPlace({
        _id: "",
        country: "country",
        stateOrRegion: "region",
        settlement: "settlement",
        name: "sinskiy",
        street: "street",
        house: "house",
      })
    ).toBe("sinskiy, house, street, settlement, region, country");
  });

  /**
   * @deprecated
   */
  test("non-gradual place is returned correctly", () => {
    expect(
      getFormattedPlace({
        _id: "",
        country: "country",
        settlement: "settlement",
        name: "sinskiy",
        house: "house",
      })
    ).toBe("sinskiy, house, settlement, country");
    expect(
      getFormattedPlace({ _id: "", country: "country", name: "sinskiy" })
    ).toBe("sinskiy, country");
  });
});
