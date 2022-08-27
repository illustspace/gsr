import { BigNumberish } from "@ethersproject/bignumber";
import { defaultAbiCoder, Result } from "@ethersproject/abi";

import { ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";

/** Decoded AssetId for an EVM ERC 1155 1:1 NFT */
export interface Fa2AssetId {
  assetType: "FA2";
  chainId: number;
  contractAddress: string;
  tokenId: BigNumberish;
}

export class Fa2Verifier extends BaseAssetTypeVerifier {
  single = false;
  assetType = "FA2" as const;

  constructor(private providerKeys: ProviderKeys) {
    super();
  }

  abis = {
    collectionId: ["uint256", "address"],
    itemId: ["uint256"],
  };

  fullyDecodeAssetId(collectionId: Result, itemId: Result): Fa2AssetId {
    const [chainId, contractAddress] = collectionId;
    const [assetTokenId] = itemId;

    return {
      assetType: this.assetType,
      chainId: chainId.toNumber(),
      contractAddress,
      tokenId: assetTokenId,
    };
  }

  encodeAssetId(assetId: Fa2AssetId) {
    const encodedCollectionId = defaultAbiCoder.encode(this.abis.collectionId, [
      assetId.chainId,
      assetId.contractAddress,
    ]);
    const encodedItemId = defaultAbiCoder.encode(this.abis.itemId, [
      assetId.tokenId,
    ]);

    return {
      assetType: this.encodedAssetType,
      collectionId: encodedCollectionId,
      itemId: encodedItemId,
    };
  }

  async verifyDecodedAssetOwnership(
    _assetId: Fa2AssetId,
    _publisherAddress: string
  ): Promise<boolean> {
    // TODO
    throw new Error("no implemented");
  }
}
