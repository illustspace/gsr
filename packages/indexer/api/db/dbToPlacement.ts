import {
  serializeGsrPlacement,
  SerializedGsrPlacement,
  DecodedAssetId,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";
import { Prisma } from "@prisma/client";

import { Placement } from "~/api/db";

/** Convert a DB placement to an SDK type */
export const dbToPlacement = (placement: Placement): SerializedGsrPlacement => {
  const validatedPlacement: ValidatedGsrPlacement = {
    decodedAssetId: placement.decodedAssetId as DecodedAssetId,
    assetId: placement.assetId,
    blockHash: placement.blockHash,
    blockLogIndex: placement.blockLogIndex,
    location: {
      // Handle bigints from DB. geohash ints should be within the JS number size
      geohash: Number(placement.geohashBits),
      bitPrecision: placement.geohashBitPrecision,
    },
    parentAssetId: placement.parentAssetId,
    placedAt: placement.placedAt,
    placedByOwner: placement.placedByOwner,
    published: placement.published,
    publisher: placement.publisher,
    sceneUri: placement.sceneUri,
    timeRange: {
      start: placement.timeRangeStart,
      end: placement.timeRangeEnd,
    },
    tx: placement.tx,
  };

  return serializeGsrPlacement(validatedPlacement);
};

/** Convert a GsrPlacement to a value good to go into the D */
export const placementToDb = (
  placement: ValidatedGsrPlacement
): Omit<Placement, "id" | "createdAt" | "decodedAssetId"> & {
  decodedAssetId: Prisma.JsonObject;
} => {
  return {
    assetId: placement.assetId,
    decodedAssetId: placement.decodedAssetId,
    blockHash: placement.blockHash,
    blockLogIndex: placement.blockLogIndex,
    geohashBits: BigInt(placement.location.geohash),
    geohashBitPrecision: placement.location.bitPrecision,
    parentAssetId: placement.parentAssetId,
    placedAt: placement.placedAt,
    placedByOwner: placement.placedByOwner,
    published: placement.published,
    publisher: placement.publisher,
    sceneUri: placement.sceneUri,
    timeRangeStart: placement.timeRange.start,
    timeRangeEnd: placement.timeRange.end,
    tx: placement.tx,
  };
};
