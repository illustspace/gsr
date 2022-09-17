import { defaultAbiCoder } from "@ethersproject/abi";
import { object, string, Asserts } from "yup";

import { ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";

const schema = object({
  assetType: string().oneOf(["MESSAGE"]).required(),
  publisherAddress: string().lowercase().required(),
  message: string().required(),
});

/** Decoded AssetId for an EVM ERC 721 1:1 NFT */
export type MessageAssetId = Asserts<typeof schema>;

const assetTypeAbis = {
  collectionId: ["string"],
  itemId: ["address"],
};

export class MessageVerifier extends BaseAssetTypeVerifier<MessageAssetId> {
  single = true;
  assetType = "MESSAGE" as const;
  schema = schema;

  constructor(_providerKeys: ProviderKeys) {
    super();
  }

  decodeAssetId(assetId: EncodedAssetId): MessageAssetId {
    const [message] = defaultAbiCoder.decode(
      assetTypeAbis.collectionId,
      assetId.collectionId
    );
    const [publisherAddress] = defaultAbiCoder.decode(
      assetTypeAbis.itemId,
      assetId.itemId
    );

    return {
      assetType: this.assetType,
      publisherAddress: publisherAddress.toLowerCase(),
      message,
    };
  }

  encodeAssetId(assetId: MessageAssetId): EncodedAssetId {
    const encodedCollectionId = defaultAbiCoder.encode(
      assetTypeAbis.collectionId,
      [assetId.message]
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
  }: GsrPlacement<MessageAssetId>): Promise<boolean> {
    return (
      decodedAssetId.publisherAddress.toLowerCase() === publisher.toLowerCase()
    );
  }
}
