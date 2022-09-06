import { DecodedAssetId } from "./asset-types";
import { AssetTypeVerifierMethods } from "./asset-types/AssetTypeVerifierMethods";
import { bitsToGeohash } from "./geohash";
import { GsrPlacementEvent } from "./typechain/GeoSpatialRegistry";

export interface GsrPlacement<AssetId extends DecodedAssetId = DecodedAssetId> {
  assetId: string;
  parentAssetId: string | null;
  decodedAssetId: AssetId;
  publisher: string;
  published: boolean;
  geohash: string;
  sceneUri: string | null;
  placedAt: Date;
  timeRangeStart: Date;
  timeRangeEnd: Date;
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
  extends Omit<
    ValidatedGsrPlacement,
    "placedAt" | "timeRangeStart" | "timeRangeEnd"
  > {
  placedAt: string;
  timeRangeStart: string;
  timeRangeEnd: string;
}

export function decodeGsrPlacementEvent(
  event: GsrPlacementEvent,
  verifier: AssetTypeVerifierMethods
): GsrPlacement {
  return {
    assetId: event.args.assetId,
    parentAssetId: isNullAddress(event.args.parentAssetId)
      ? null
      : event.args.parentAssetId,
    decodedAssetId: verifier.decodeAssetId(event.args.fullAssetId),
    publisher: event.args.publisher,
    published: event.args.published,

    geohash: bitsToGeohash(
      event.args.geohash.geohash.toNumber(),
      event.args.geohash.bitPrecision
    ),

    sceneUri: event.args.sceneUri,
    placedAt: new Date(event.args.placedAt.toNumber() * 1000),

    timeRangeStart: new Date(event.args.timeRange.start.toNumber() * 1000),
    timeRangeEnd: new Date(event.args.timeRange.end.toNumber() * 1000),

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
  return {
    ...placement,
    placedAt: placement.placedAt.toISOString(),
    timeRangeStart: placement.timeRangeStart.toISOString(),
    timeRangeEnd: placement.timeRangeEnd.toISOString(),
  };
}

export function deserializeGsrPlacement(
  serializeGsrPlacement: SerializedGsrPlacement
): ValidatedGsrPlacement {
  return {
    ...serializeGsrPlacement,
    placedAt: new Date(serializeGsrPlacement.placedAt),
    timeRangeStart: new Date(serializeGsrPlacement.timeRangeStart),
    timeRangeEnd: new Date(serializeGsrPlacement.timeRangeEnd),
  };
}
