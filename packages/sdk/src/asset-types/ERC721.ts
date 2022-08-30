import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { defaultAbiCoder } from "@ethersproject/abi";

import { getChainProvider, ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";

/** Decoded AssetId for an EVM ERC 721 1:1 NFT */
export type Erc721AssetId = {
  assetType: "ERC721";
  chainId: number;
  contractAddress: string;
  tokenId: string;
};

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

const assetTypeAbis = {
  collectionId: ["uint256", "address"],
  itemId: ["uint256"],
};

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

  decodeAssetId(assetId: EncodedAssetId): Erc721AssetId {
    const [chainId, contractAddress] = defaultAbiCoder.decode(
      assetTypeAbis.collectionId,
      assetId.collectionId
    );
    const [tokenId] = defaultAbiCoder.decode(
      assetTypeAbis.itemId,
      assetId.itemId
    );

    return {
      assetType: this.assetType,
      chainId: chainId.toNumber(),
      contractAddress,
      tokenId,
    };
  }

  encodeAssetId(assetId: Erc721AssetId): EncodedAssetId {
    const encodedCollectionId = defaultAbiCoder.encode(
      assetTypeAbis.collectionId,
      [assetId.chainId, assetId.contractAddress]
    );
    const encodedItemId = defaultAbiCoder.encode(assetTypeAbis.itemId, [
      assetId.tokenId,
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
      ERC_721_ABI,
      provider
    );

    // Get the owner, returning '' if the asset does not exist.
    const owner = await contract
      .ownerOf(decodedAssetId.tokenId)
      .catch(() => "");

    return publisher.toLowerCase() === owner.toLowerCase();
  }
}
