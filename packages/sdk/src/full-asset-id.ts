/* eslint-disable no-else-return */
import { defaultAbiCoder } from "@ethersproject/abi";
import type { BigNumberish } from "@ethersproject/bignumber";
import { keccak256 } from "@ethersproject/keccak256";

import {
  AssetType,
  getDecodedAssetType,
  getEncodedAssetType,
} from "./known-asset-types";

const assetTypeAbis: Record<
  AssetType,
  {
    collectionId: string[];
    itemId: string[];
  }
> = {
  ERC721: {
    collectionId: ["uint256", "address"],
    itemId: ["uint256"],
  },
  ERC1155: {
    collectionId: ["uint256", "address"],
    itemId: ["uint256"],
  },
};

export interface Erc721AssetId {
  assetType: "ERC721";
  chainId: BigNumberish;
  contractAddress: string;
  tokenId: BigNumberish;
}

export interface Erc1155AssetId {
  assetType: "ERC1155";
  chainId: BigNumberish;
  contractAddress: string;
  tokenId: BigNumberish;
}

export type DecodedAssetId = Erc721AssetId | Erc1155AssetId;

export interface EncodedAssetId {
  assetType: string;
  collectionId: string;
  itemId: string;
}

export function decodeAssetId({
  assetType: encodedAssetType,
  collectionId,
  itemId,
}: EncodedAssetId): DecodedAssetId {
  // Get the actual name of the asset type.
  const assetType = getDecodedAssetType(encodedAssetType);

  if (!assetType) {
    throw new Error(`Unknown encoded asset type: ${encodedAssetType}`);
  }

  // Get the ABIs
  const abis = assetTypeAbis[assetType];
  // Decode the collectionId and itemId
  const decodedCollectionId = defaultAbiCoder.decode(
    abis.collectionId,
    collectionId
  );
  const decodedItemId = defaultAbiCoder.decode(abis.itemId, itemId);

  if (assetType === "ERC721" || assetType === "ERC1155") {
    const [chainId, contractAddress] = decodedCollectionId;
    const [assetTokenId] = decodedItemId;

    return {
      assetType,
      chainId,
      contractAddress,
      tokenId: assetTokenId,
    };
  }

  throw new Error(`Unhandled asset type: ${assetType}`);
}

export function encodeAssetId(assetId: DecodedAssetId): EncodedAssetId {
  const { assetType } = assetId;
  // Get the ABIs
  const abis = assetTypeAbis[assetType];

  if (!abis) {
    throw new Error(`Unknown asset type: ${assetType}`);
  }

  // Encode the collectionId and itemId
  const encodedAssetType = getEncodedAssetType(assetType);

  if (assetType === "ERC721" || assetType === "ERC1155") {
    const encodedCollectionId = defaultAbiCoder.encode(abis.collectionId, [
      assetId.chainId,
      assetId.contractAddress,
    ]);
    const encodedItemId = defaultAbiCoder.encode(abis.itemId, [
      assetId.tokenId,
    ]);

    return {
      assetType: encodedAssetType,
      collectionId: encodedCollectionId,
      itemId: encodedItemId,
    };
  }

  throw new Error(`Unhandled asset type: ${assetType}`);
}

export function hashAssetId(assetId: DecodedAssetId): string {
  const encodedAssetId = encodeAssetId(assetId);
  return hashEncodedAssetId(encodedAssetId);
}

export function hashEncodedAssetId({
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
