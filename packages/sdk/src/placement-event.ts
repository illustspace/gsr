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
  blockNumber: number;
  tx: string;
  // TODO: add this to the GSR
  linkedAccount?: string;
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

    blockNumber: event.blockNumber,
    tx: event.transactionHash,
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
