import { DecodedAssetId } from "./AssetTypeVerifier";

/**
 * An encoded version of an AssetId, with the assetType, collectionId, and itemId
 * abiEncoded to be sent to the blockchain.
 */
export interface EncodedAssetId {
  assetType: string;
  collectionId: string;
  itemId: string;
}

export interface AnyDecodedAssetId {
  assetType: string;
}

export abstract class AssetTypeVerifierMethods {
  abstract decodeAssetId(assetId: EncodedAssetId): AnyDecodedAssetId;

  abstract encodeAssetId(assetId: AnyDecodedAssetId): EncodedAssetId;

  /** Hash a decoded AssetId to a simple AssetId used for GSR queries. */
  abstract hashAssetId(assetId: AnyDecodedAssetId): string;

  /** Hash an EncodedAssetId to a simple AssetId used for GSR queries. */
  abstract hashEncodedAssetId({
    assetType,
    collectionId,
    itemId,
  }: EncodedAssetId): string;

  abstract verifyAssetOwnership(
    decodedAssetId: DecodedAssetId,
    publisherAddress: string
  ): Promise<boolean>;
}
