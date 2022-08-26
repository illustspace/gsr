/* eslint-disable no-else-return */
import { defaultAbiCoder } from "@ethersproject/abi";
import type { BigNumberish } from "@ethersproject/bignumber";
import { keccak256 } from "@ethersproject/keccak256";

import {
  AssetType,
  getDecodedAssetType,
  getEncodedAssetType,
} from "./known-asset-types";

/**
 * ABIs for decoding the collection/item IDs for a given asset type.
 * Indexed by plain assetType
 */
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

/** Decoded AssetId for an EVM ERC 721 1:1 NFT */
export interface Erc721AssetId {
  assetType: "ERC721";
  chainId: BigNumberish;
  contractAddress: string;
  tokenId: BigNumberish;
}

/** Decoded AssetId for an EVM ERC 1155 NFT */
export interface Erc1155AssetId {
  assetType: "ERC1155";
  chainId: BigNumberish;
  contractAddress: string;
  tokenId: BigNumberish;
}

/** All known decoded asset ID types */
export type DecodedAssetId = Erc721AssetId | Erc1155AssetId;

/**
 * An encoded version of an AssetId, with the assetType, collectionId, and itemId
 * abiEncoded to be sent to the blockchain.
 */
export interface EncodedAssetId {
  assetType: string;
  collectionId: string;
  itemId: string;
}

/** Decode an EncodedAssetId based on its AssetType into a DecodedAssetId. */
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

/** Encode an AssetId for the blockchain. */
export function encodeAssetId(assetId: DecodedAssetId): EncodedAssetId {
  const { assetType } = assetId;
  // Get the ABIs
  const abis = assetTypeAbis[assetType];

  const encodedAssetType = getEncodedAssetType(assetType);

  if (!(abis && encodedAssetType)) {
    throw new Error(`Unknown asset type: ${assetType}`);
  }

  // Encode the collectionId and itemId

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

/** Hash a decoded AssetId to a simple AssetId used for GSR queries. */
export function hashAssetId(assetId: DecodedAssetId): string {
  const encodedAssetId = encodeAssetId(assetId);
  return hashEncodedAssetId(encodedAssetId);
}

/** Hash an EncodedAssetId to a simple AssetId used for GSR queries. */
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
