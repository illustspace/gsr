import { BigNumber } from "@ethersproject/bignumber";

/** Return value from placeOf */
export interface PlaceOf {
  geohash: BigNumber;
  bitPrecision: number;
  startTime: Date;
}
