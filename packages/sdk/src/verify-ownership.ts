/* eslint-disable no-else-return */

import { BaseProvider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";

import Erc721Abi from "~/abis/Erc721.json";
import Erc1155Abi from "~/abis/Erc1155.json";

import { DecodedAssetId } from "./full-asset-id";

/**
 * Verify that an AssetId describes an asset owned by the given user.
 * The AssetId determines which * external source of truth should be
 * queried for ownership data.
 */
export async function verifyAssetOwnership(
  // TODO: set provider based on chainId
  provider: BaseProvider,
  assetId: DecodedAssetId,
  publisherAddress: string
): Promise<boolean> {
  if (assetId.assetType === "ERC721") {
    const contract = new Contract(
      assetId.contractAddress,
      Erc721Abi.abi,
      provider
    );

    // Get the owner, returning '' if the asset does not exist.
    const owner = await contract.ownerOf(assetId.tokenId).catch(() => "");

    // If there is no owner, it is not owned.
    if (!owner) return false;

    // Check if the publisher is the owner.
    return publisherAddress.toLowerCase() === owner.toLowerCase();
  } else if (assetId.assetType === "ERC1155") {
    const contract = new Contract(
      assetId.contractAddress,
      Erc1155Abi.abi,
      provider
    );

    // Check if the publisher owns any of the asset.
    const balance = await contract
      .balanceOf(publisherAddress, assetId.tokenId)
      .catch(() => BigNumber.from(0));

    return balance.gt(0);
  }

  throw new Error("Unhandled assetType");
}
