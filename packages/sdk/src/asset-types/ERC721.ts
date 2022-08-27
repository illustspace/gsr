import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { BigNumberish } from "@ethersproject/bignumber";
import { defaultAbiCoder, Result } from "@ethersproject/abi";

import { getChainProvider, ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";

/** Decoded AssetId for an EVM ERC 721 1:1 NFT */
export interface Erc721AssetId {
  assetType: "ERC721";
  chainId: number;
  contractAddress: string;
  tokenId: BigNumberish;
}

const ERC_721_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class Erc721Verifier extends BaseAssetTypeVerifier {
  single = true;
  assetType = "ERC721" as const;

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

  fullyDecodeAssetId(collectionId: Result, itemId: Result): Erc721AssetId {
    const [chainId, contractAddress] = collectionId;
    const [assetTokenId] = itemId;

    return {
      assetType: this.assetType,
      chainId: chainId.toNumber(),
      contractAddress,
      tokenId: assetTokenId,
    };
  }

  encodeAssetId(assetId: Erc721AssetId) {
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
    assetId: Erc721AssetId,
    publisherAddress: string
  ): Promise<boolean> {
    const provider =
      this.customProviders[assetId.chainId] ||
      getChainProvider(assetId.chainId, this.providerKeys);

    const contract = new Contract(
      assetId.contractAddress,
      ERC_721_ABI,
      provider
    );

    // Get the owner, returning '' if the asset does not exist.
    const owner = await contract.ownerOf(assetId.tokenId).catch(() => "");

    return publisherAddress.toLowerCase() === owner.toLowerCase();
  }
}
