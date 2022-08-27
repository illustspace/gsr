import { defaultAbiCoder, Result } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { DecodedAssetId } from "./AssetTypeVerifier";
import {
  AssetTypeVerifierMethods,
  AnyDecodedAssetId,
  EncodedAssetId,
} from "./AssetTypeVerifierMethods";

/**
 * An encoded version of an AssetId, with the assetType, collectionId, and itemId
 * abiEncoded to be sent to the blockchain.
 */
export interface PartiallyDecodedAssetId {
  assetType: string;
  collectionId: Result;
  itemId: Result;
}

export abstract class BaseAssetTypeVerifier extends AssetTypeVerifierMethods {
  abstract assetType: string;
  private cachedEncodedAssetType?: string;
  abstract single: boolean;

  abstract abis: {
    collectionId: string[];
    itemId: string[];
  };

  get encodedAssetType(): string {
    this.cachedEncodedAssetType ||= keccak256(toUtf8Bytes(this.assetType));
    return this.cachedEncodedAssetType;
  }

  decodeAssetId(assetId: EncodedAssetId): AnyDecodedAssetId {
    const decodedCollectionId = defaultAbiCoder.decode(
      this.abis.collectionId,
      assetId.collectionId
    );
    const decodedItemId = defaultAbiCoder.decode(
      this.abis.itemId,
      assetId.itemId
    );

    return this.fullyDecodeAssetId(decodedCollectionId, decodedItemId);
  }

  protected abstract fullyDecodeAssetId(
    collectionId: Result,
    itemId: Result
  ): AnyDecodedAssetId;

  abstract encodeAssetId(assetId: AnyDecodedAssetId): EncodedAssetId;

  /** Hash a decoded AssetId to a simple AssetId used for GSR queries. */
  hashAssetId(assetId: AnyDecodedAssetId): string {
    const encodedAssetId = this.encodeAssetId(assetId);
    return this.hashEncodedAssetId(encodedAssetId);
  }

  /** Hash an EncodedAssetId to a simple AssetId used for GSR queries. */
  hashEncodedAssetId({
    assetType,
    collectionId,
    itemId,
  }: EncodedAssetId): string {
    return keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "bytes", "bytes"],
        [assetType, collectionId, itemId]
      )
    );
  }

  verifyAssetOwnership(
    decodedAssetId: DecodedAssetId,
    publisherAddress: string
  ): Promise<boolean> {
    return this.verifyDecodedAssetOwnership(decodedAssetId, publisherAddress);
  }

  protected abstract verifyDecodedAssetOwnership(
    assetId: AnyDecodedAssetId,
    publisherAddress: string
  ): Promise<boolean>;
}
