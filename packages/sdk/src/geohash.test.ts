import { geohashToBits, bitsToGeohash } from "./geohash";

describe("geohash", () => {
  it("goes to bits", () => {
    expect(geohashToBits("dc0de")).toBe(0b01100_01011_00000_01100_01101);
  });

  it("goes from bits", () => {
    expect(bitsToGeohash(0b01100_01011_00000_01100_01101, 5)).toBe("dc0de");
  });
});
