import { defaultAbiCoder } from "@ethersproject/abi";
import { object, string, Asserts, number } from "yup";

import { GsrPlacement } from "~/placement-event";
import { ProviderKeys } from "~/provider";

import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { transformBigNumberToInteger } from "./schema";

const schema = object({
  assetType: string().oneOf(["MESSAGE"]).required(),
  publisherAddress: string().lowercase().required(),
  message: string().required(),
  placementNumber: number()
    .transform(transformBigNumberToInteger)
    .integer()
    .positive()
    .required(),
});

/** Decoded AssetId for a text-based Message */
export type MessageAssetId = Asserts<typeof schema>;

const assetTypeAbis = {
  // message
  collectionId: ["string"],
  // publisherAddress, placementNumber
  itemId: ["address", "uint256"],
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
    const [publisherAddress, placementNumber] = defaultAbiCoder.decode(
      assetTypeAbis.itemId,
      assetId.itemId
    );

    return schema.validateSync({
      assetType: this.assetType,
      publisherAddress,
      message,
      placementNumber,
    });
  }

  encodeAssetId(assetId: MessageAssetId): EncodedAssetId {
    const encodedCollectionId = defaultAbiCoder.encode(
      assetTypeAbis.collectionId,
      [assetId.message]
    );
    const encodedItemId = defaultAbiCoder.encode(assetTypeAbis.itemId, [
      assetId.publisherAddress,
      assetId.placementNumber,
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
