import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { defaultAbiCoder } from "@ethersproject/abi";

import { getChainProvider, ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";

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
export type Erc1155AssetId = {
  assetType: "ERC1155";
  chainId: number;
  contractAddress: string;
  tokenId: string;
  publisherAddress: string;
  itemNumber: string;
};

const assetTypeAbis = {
  collectionId: ["uint256", "address", "uint256"],
  itemId: ["address", "uint256"],
};

export class Erc1155Verifier extends BaseAssetTypeVerifier<Erc1155AssetId> {
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

  decodeAssetId(assetId: EncodedAssetId): Erc1155AssetId {
    const [chainId, contractAddress, tokenId] = defaultAbiCoder.decode(
      assetTypeAbis.collectionId,
      assetId.collectionId
    );

    const [publisherAddress, itemNumber] = defaultAbiCoder.decode(
      assetTypeAbis.itemId,
      assetId.collectionId
    );

    return {
      assetType: this.assetType,
      chainId: chainId.toNumber(),
      contractAddress,
      tokenId,
      publisherAddress,
      itemNumber,
    };
  }

  encodeAssetId(assetId: Erc1155AssetId) {
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
  }: GsrPlacement<Erc1155AssetId>): Promise<boolean> {
    // For 1155, each assetId is unique for a given publisher.
    if (
      decodedAssetId.publisherAddress.toLowerCase() !== publisher.toLowerCase()
    ) {
      return false;
    }

    const provider =
      this.customProviders[decodedAssetId.chainId] ||
      getChainProvider(decodedAssetId.chainId, this.providerKeys);

    const contract = new Contract(
      decodedAssetId.contractAddress,
      ERC_1155_ABI,
      provider
    );

    // Get the owner, returning '' if the asset does not exist.
    const balance = contract
      .balanceOf(publisher, decodedAssetId.tokenId)
      .catch((error: any) => {
        console.error(error);
        return 0;
      });

    // Ensure the owner has enough assets to own numbered placement.
    return BigNumber.from(balance).gte(decodedAssetId.itemNumber);
  }
}
