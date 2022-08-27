import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { BigNumberish } from "@ethersproject/bignumber";
import { defaultAbiCoder, Result } from "@ethersproject/abi";

import { getChainProvider, ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";

const ERC_1155_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

/** Decoded AssetId for an EVM ERC 1155 1:1 NFT */
export interface Erc1155AssetId {
  assetType: "ERC1155";
  chainId: number;
  contractAddress: string;
  tokenId: BigNumberish;
}

export class Erc1155Verifier extends BaseAssetTypeVerifier {
  single = false;
  assetType = "ERC1155" as const;

  constructor(
    private providerKeys: ProviderKeys,
    private customProviders: {
      [chainId: number]: Provider;
    } = {}
  ) {
    super();
  }

  abis = {
    collectionId: ["uint256", "address"],
    itemId: ["uint256"],
  };

  fullyDecodeAssetId(collectionId: Result, itemId: Result): Erc1155AssetId {
    const [chainId, contractAddress] = collectionId;
    const [assetTokenId] = itemId;

    return {
      assetType: this.assetType,
      chainId: chainId.toNumber(),
      contractAddress,
      tokenId: assetTokenId,
    };
  }

  encodeAssetId(assetId: Erc1155AssetId) {
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
    assetId: Erc1155AssetId,
    publisherAddress: string
  ): Promise<boolean> {
    const provider =
      this.customProviders[assetId.chainId] ||
      getChainProvider(assetId.chainId, this.providerKeys);

    const contract = new Contract(
      assetId.contractAddress,
      ERC_1155_ABI,
      provider
    );

    // Get the owner, returning '' if the asset does not exist.
    const owner = await contract
      .ownerOf(assetId.tokenId)
      .catch((error: any) => {
        console.error(error);
        return "";
      });

    return publisherAddress.toLowerCase() === owner.toLowerCase();
  }
}
