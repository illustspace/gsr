import { BigNumber } from "@ethersproject/bignumber";

import { DecodedAssetId } from "./asset-types";
import { AssetTypeVerifierMethods } from "./asset-types/AssetTypeVerifierMethods";
import { GsrPlacementEvent } from "./typechain/GeoSpatialRegistry";

export interface GsrPlacement<AssetId extends DecodedAssetId = DecodedAssetId> {
  assetId: string;
  parentAssetId: string | null;
  decodedAssetId: AssetId;
  publisher: string;
  published: boolean;
  location: {
    geohash: number;
    bitPrecision: number;
  };
  sceneUri: string | null;
  placedAt: Date;
  timeRange: {
    start: Date | null;
    end: Date | null;
  };
  blockHash: string;
  /** The index of the placement event within the block. Used with blockNumber to uniquely identify a placement */
  blockLogIndex: number;
  /** The transaction hash */
  tx: string;
}

/** A GsrPlacement that has gone through ownership validation. */
export interface ValidatedGsrPlacement extends GsrPlacement {
  /** If true, validated as placed by owner. */
  placedByOwner: boolean;
}

/** A ValidatedGsrPlacement to be sent over the wire */
export interface SerializedGsrPlacement
  extends Omit<ValidatedGsrPlacement, "placedAt" | "timeRange"> {
  placedAt: string;
  timeRange: {
    start: string | null;
    end: string | null;
  };
}

/** A unique identifier for a Placement */
export interface PlacementId {
  /** The hash of the block the placement was mined in */
  blockHash: string;
  /** The log index of the placement in the block */
  blockLogIndex: number;
}

export function decodeGsrPlacementEvent(
  event: GsrPlacementEvent,
  verifier: AssetTypeVerifierMethods
): GsrPlacement {
  const start = event.args.timeRange.start.toNumber();
  const end = event.args.timeRange.end.toNumber();

  return {
    assetId: event.args.assetId,
    parentAssetId: isNullAddress(event.args.parentAssetId)
      ? null
      : event.args.parentAssetId,
    decodedAssetId: verifier.decodeAssetId(event.args.fullAssetId),
    publisher: event.args.publisher.toLowerCase(),
    published: event.args.published,

    location: {
      geohash: event.args.geohash.geohash.toNumber(),
      bitPrecision: BigNumber.from(event.args.geohash.bitPrecision).toNumber(),
    },

    sceneUri: event.args.sceneUri || null,
    placedAt: new Date(event.args.placedAt.toNumber() * 1000),

    timeRange: {
      start: start
        ? new Date(event.args.timeRange.start.toNumber() * 1000)
        : null,
      end: end ? new Date(event.args.timeRange.end.toNumber() * 1000) : null,
    },

    blockHash: event.blockHash,
    tx: event.transactionHash,
    blockLogIndex: event.logIndex,
  };
}

const isNullAddress = (address: string) => {
  return /0x0+$/.test(address);
};

export function serializeGsrPlacement(
  placement: ValidatedGsrPlacement
): SerializedGsrPlacement {
  const { start, end } = placement.timeRange;
  return {
    ...placement,
    placedAt: placement.placedAt.toISOString(),
    timeRange: {
      start: start ? start.toISOString() : null,
      end: end ? end.toISOString() : null,
    },
  };
}

export function deserializeGsrPlacement(
  serializeGsrPlacement: SerializedGsrPlacement
): ValidatedGsrPlacement {
  const { start, end } = serializeGsrPlacement.timeRange;
  return {
    ...serializeGsrPlacement,
    placedAt: new Date(serializeGsrPlacement.placedAt),
    timeRange: {
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null,
    },
  };
}

/** Extract a unique ID from a placement. */
export const placementToId = (placement: PlacementId) => {
  return `${placement.blockHash}_${placement.blockLogIndex}`;
};

/** Extract the pieces the unique placement ID. */
export const placementIdToData = (placementId: string): PlacementId => {
  const [blockHash, blockLogIndex] = placementId.split("_");

  if (!blockHash || !blockLogIndex) {
    throw new Error("Invalid placement ID");
  }

  return { blockHash, blockLogIndex: Number(blockLogIndex) };
};
