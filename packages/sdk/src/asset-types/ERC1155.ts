import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { object, string, number, Asserts } from "yup";

import { GsrPlacement } from "~/placement-event";
import { getChainProvider, ProviderKeys } from "~/provider";

import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import {
  transformBigNumberToDecimalString,
  transformBigNumberToInteger,
} from "./schema";

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

/** Validation schema for ERC721 */
const schema = object({
  assetType: string().oneOf(["ERC1155"]).required(),
  chainId: number()
    .transform(transformBigNumberToInteger)
    .integer()
    .positive()
    .required(),
  contractAddress: string().lowercase().defined(),
  tokenId: string()
    .transform(transformBigNumberToDecimalString)
    .lowercase()
    .required(),
  publisherAddress: string().lowercase().required(),
  itemNumber: string().transform(transformBigNumberToDecimalString).required(),
});

/** Decoded AssetId for an EVM ERC 1155 1:1 NFT */
export type Erc1155AssetId = Asserts<typeof schema>;

const assetTypeAbis = {
  collectionId: ["uint256", "address", "uint256"],
  itemId: ["address", "uint256"],
};

export class Erc1155Verifier extends BaseAssetTypeVerifier<Erc1155AssetId> {
  single = false;
  assetType = "ERC1155" as const;
  schema = schema;

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
    const balance = await contract
      .balanceOf(publisher, decodedAssetId.tokenId)
      .catch((error: any) => {
        console.error(error);
        return 0;
      });

    // Ensure the owner has enough assets to own numbered placement.
    return BigNumber.from(balance).gte(decodedAssetId.itemNumber);
  }
}
