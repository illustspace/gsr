import { defaultAbiCoder } from "@ethersproject/abi";
import { object, string, Asserts } from "yup";
import { getAddress } from "ethers/lib/utils";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";
import { transformBigNumberToDecimalString } from "./schema";
import { verifyAliasAddress, verifyBalance } from "./helpers/Tezos";

/** Validation schema for ERC721 */
const schema = object({
  assetType: string().oneOf(["FA2"]).required(),
  chainId: string().oneOf(["mainnet", "ghostnet", "jakartanet"]).required(),
  contractAddress: string().required(),
  tokenId: string()
    .transform(transformBigNumberToDecimalString)
    .lowercase()
    .required(),
  publisherAddress: string().required(),
  itemNumber: string().transform(transformBigNumberToDecimalString).required(),
});

/** Decoded AssetId for an TEZOS FA2 1:1 NFT */
export type Fa2AssetId = Asserts<typeof schema>;

const assetTypeAbis = {
  collectionId: ["string", "string", "uint256"],
  itemId: ["string", "string"],
};

export class Fa2Verifier extends BaseAssetTypeVerifier<Fa2AssetId> {
  single = false;
  assetType = "FA2" as const;
  schema = schema;

  decodeAssetId(assetId: EncodedAssetId): Fa2AssetId {
    const [chainId, contractAddress, tokenId] = defaultAbiCoder.decode(
      assetTypeAbis.collectionId,
      assetId.collectionId
    );

    const [publisherAddress, itemNumber] = defaultAbiCoder.decode(
      assetTypeAbis.itemId,
      assetId.itemId
    );

    return schema.validateSync({
      assetType: this.assetType,
      chainId,
      contractAddress,
      tokenId,
      publisherAddress,
      itemNumber,
    });
  }

  encodeAssetId(assetId: Fa2AssetId) {
    const encodedCollectionId = defaultAbiCoder.encode(
      assetTypeAbis.collectionId,
      [assetId.chainId, assetId.contractAddress, assetId.tokenId]
    );
    const encodedItemId = defaultAbiCoder.encode(assetTypeAbis.itemId, [
      assetId.publisherAddress,
      assetId.itemNumber,
    ]);

    return {
      assetType: this.encodedAssetType,
      collectionId: encodedCollectionId,
      itemId: encodedItemId,
    };
  }

  async verifyAssetOwnership({
    decodedAssetId,
    publisher,
  }: GsrPlacement<Fa2AssetId>): Promise<boolean> {
    try {
      await verifyBalance({
        chainId: decodedAssetId.chainId,
        contract: decodedAssetId.contractAddress,
        owner: decodedAssetId.publisherAddress,
        tokenId: decodedAssetId.tokenId,
        amount: decodedAssetId.itemNumber,
      });

      //  Verify that the Tezos Publisher Wallet address is alias with the EVM Wallet address
      await verifyAliasAddress({
        chainId: decodedAssetId.chainId,
        publisher: decodedAssetId.publisherAddress,
        evmAlias: getAddress(publisher), // getAddress() returns a checksummed address for Alias Address validation
      });

      return true;
    } catch (e) {
      return false;
    }
  }
}
