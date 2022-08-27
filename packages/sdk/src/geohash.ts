import chunk from "lodash/chunk";

export interface GeohashBits {
  geohash: number;
  bitPrecision: number;
}

const geohashLetters = "0123456789bcdefghjkmnpqrstuvwxyz";

export const geohashToBits = (geohash: string): number => {
  return geohash
    .split("")
    .map((char) => geohashLetters.indexOf(char))
    .reduce((acc, value, index, array) => {
      const place = array.length - 1 - index;
      return acc + value * 2 ** (place * 5);
    }, 0);
};

export const bitsToGeohash = (bits: number, precision: number): string => {
  const bitNumbers = bits
    .toString(2)
    .padStart(precision * 5, "0")
    .split("")
    .map(Number);
  const letters = chunk(bitNumbers, 5).map((values) => {
    const index = values.reduce((acc, value, i, array) => {
      const place = array.length - 1 - i;
      return acc + value * 2 ** place;
    }, 0);
    return geohashLetters[index];
  });

  return letters.join("");
};
