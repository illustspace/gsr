import { defaultAbiCoder } from "@ethersproject/abi";

import { ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";

/** Decoded AssetId for an EVM ERC 721 1:1 NFT */
export type SelfPublishedAssetId = {
  assetType: "SELF_PUBLISHED";
  publisherAddress: string;
  assetHash: string;
};

const assetTypeAbis = {
  collectionId: ["address"],
  itemId: ["uint256"],
};

export class SelfPublishedVerifier extends BaseAssetTypeVerifier {
  single = true;
  assetType = "SELF_PUBLISHED" as const;

  constructor(private providerKeys: ProviderKeys) {
    super();
  }

  decodeAssetId(assetId: EncodedAssetId): SelfPublishedAssetId {
    const [assetHash] = defaultAbiCoder.decode(
      assetTypeAbis.collectionId,
      assetId.collectionId
    );
    const [publisherAddress] = defaultAbiCoder.decode(
      assetTypeAbis.itemId,
      assetId.itemId
    );

    return {
      assetType: this.assetType,
      publisherAddress,
      assetHash,
    };
  }

  encodeAssetId(assetId: SelfPublishedAssetId): EncodedAssetId {
    const encodedCollectionId = defaultAbiCoder.encode(
      assetTypeAbis.collectionId,
      [assetId.assetHash]
    );
    const encodedItemId = defaultAbiCoder.encode(assetTypeAbis.itemId, [
      assetId.publisherAddress,
    ]);

    return {
      assetType: this.encodedAssetType,
      collectionId: encodedCollectionId,
      itemId: encodedItemId,
    };
  }

  /** Just verify that the asset ID matches the poster. */
  async verifyAssetOwnership({
    decodedAssetId,
    publisher,
  }: GsrPlacement<SelfPublishedAssetId>): Promise<boolean> {
    return (
      decodedAssetId.publisherAddress.toLowerCase() === publisher.toLowerCase()
    );
  }
}
