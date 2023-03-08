import { GsrPlacement } from "~/placement-event";

import type { DecodedAssetId } from "./AssetTypeVerifier";

/**
 * An encoded version of an AssetId, with the assetType, collectionId, and itemId
 * abiEncoded to be sent to the blockchain.
 */
export interface EncodedAssetId {
  assetType: string;
  collectionId: string;
  itemId: string;
}

export abstract class AssetTypeVerifierMethods {
  abstract parseAssetId(decodedAssetId: any, partial?: boolean): DecodedAssetId;

  abstract decodeAssetId(assetId: EncodedAssetId): DecodedAssetId;

  abstract encodeAssetId(assetId: DecodedAssetId): EncodedAssetId;

  /** Hash a decoded AssetId to a simple AssetId used for GSR queries. */
  abstract hashAssetId(assetId: DecodedAssetId): string;

  /** Hash an EncodedAssetId to a simple AssetId used for GSR queries. */
  abstract hashEncodedAssetId({
    assetType,
    collectionId,
    itemId,
  }: EncodedAssetId): string;

  abstract verifyAssetOwnership(placement: GsrPlacement): Promise<boolean>;
}
