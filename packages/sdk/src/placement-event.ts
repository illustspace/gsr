import { DecodedAssetId } from "./asset-types";
import { AssetTypeVerifierMethods } from "./asset-types/AssetTypeVerifierMethods";
import { bitsToGeohash } from "./geohash";
import { GsrPlacementEvent } from "./typechain/GeoSpatialRegistry";

export interface GsrPlacement {
  assetId: string;
  parentAssetId: string;
  decodedAssetId: DecodedAssetId;
  publisher: string;
  published: boolean;
  geohash: string;
  sceneUri: string;
  placedAt: Date;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  blockNumber: number;
  // TODO: add this to the GSR
  linkedAccount?: string;
}

export function decodeGsrPlacementEvent(
  event: GsrPlacementEvent,
  verifier: AssetTypeVerifierMethods
): GsrPlacement {
  return {
    assetId: event.args.assetId,
    parentAssetId: event.args.parentAssetId,
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
  };
}
