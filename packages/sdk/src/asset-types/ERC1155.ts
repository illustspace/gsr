import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
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
  itemNumber: string;
};

const assetTypeAbis = {
  collectionId: ["uint256", "address"],
  itemId: ["uint256", "uint256"],
};

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

  decodeAssetId(assetId: EncodedAssetId): Erc1155AssetId {
    const [chainId, contractAddress] = defaultAbiCoder.decode(
      assetTypeAbis.collectionId,
      assetId.collectionId
    );

    const [tokenId, itemNumber] = defaultAbiCoder.decode(
      assetTypeAbis.itemId,
      assetId.collectionId
    );

    return {
      assetType: this.assetType,
      chainId: chainId.toNumber(),
      contractAddress,
      tokenId,
      itemNumber,
    };
  }

  encodeAssetId(assetId: Erc1155AssetId) {
    const encodedCollectionId = defaultAbiCoder.encode(
      assetTypeAbis.collectionId,
      [assetId.chainId, assetId.contractAddress]
    );
    const encodedItemId = defaultAbiCoder.encode(assetTypeAbis.itemId, [
      assetId.tokenId,
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
  }: GsrPlacement): Promise<boolean> {
    const provider =
      this.customProviders[decodedAssetId.chainId] ||
      getChainProvider(decodedAssetId.chainId, this.providerKeys);

    const contract = new Contract(
      decodedAssetId.contractAddress,
      ERC_1155_ABI,
      provider
    );

    // Get the owner, returning '' if the asset does not exist.
    const owner = await contract
      .ownerOf(decodedAssetId.tokenId)
      .catch((error: any) => {
        console.error(error);
        return "";
      });

    return publisher.toLowerCase() === owner.toLowerCase();
  }
}
