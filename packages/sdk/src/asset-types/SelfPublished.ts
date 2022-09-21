import { defaultAbiCoder } from "@ethersproject/abi";
import { object, string, Asserts } from "yup";

import { ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";
import { transformBigNumberToHexString } from "./schema";

const schema = object({
  assetType: string().oneOf(["SELF_PUBLISHED"]).required(),
  publisherAddress: string().lowercase().required(),
  assetHash: string().transform(transformBigNumberToHexString).required(),
});

/** Decoded AssetId for an EVM ERC 721 1:1 NFT */
export type SelfPublishedAssetId = Asserts<typeof schema>;

const assetTypeAbis = {
  collectionId: ["uint256"],
  itemId: ["address"],
};

export class SelfPublishedVerifier extends BaseAssetTypeVerifier<SelfPublishedAssetId> {
  single = true;
  assetType = "SELF_PUBLISHED" as const;
  schema = schema;

  constructor(_providerKeys: ProviderKeys) {
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

    return schema.validateSync({
      assetType: this.assetType,
      publisherAddress,
      assetHash,
    });
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
