import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { defaultAbiCoder } from "@ethersproject/abi";
import { object, number, string, Asserts } from "yup";

import { getChainProvider, ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";
import {
  transformBigNumberToDecimalString,
  transformBigNumberToInteger,
} from "./schema";

/** Validation schema for ERC721 */
const schema = object({
  assetType: string().oneOf(["ERC721"]).required(),
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
});

/** Decoded AssetId for an EVM ERC 721 1:1 NFT */
export type Erc721AssetId = Asserts<typeof schema>;

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

export class Erc721Verifier extends BaseAssetTypeVerifier<Erc721AssetId> {
  single = true;
  assetType = "ERC721" as const;

  schema = schema;

  constructor(
    private providerKeys: ProviderKeys,
    private customProviders: {
      [chainId: number]: Provider;
    } = {}
  ) {
    super();
  }

  parseAssetId(serializedAssetId: unknown): Erc721AssetId {
    return schema.validateSync(serializedAssetId);
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
      contractAddress: contractAddress.toLowerCase(),
      tokenId: tokenId.toString(),
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
  }: GsrPlacement<Erc721AssetId>): Promise<boolean> {
    const provider =
      this.customProviders[decodedAssetId.chainId] ||
      getChainProvider(decodedAssetId.chainId, this.providerKeys);

    const contract = new Contract(
      decodedAssetId.contractAddress,
      ERC_721_ABI,
      provider
    );

    // Get the owner, returning '' if the asset does not exist.
    const owner = await contract.ownerOf(decodedAssetId.tokenId);

    return publisher.toLowerCase() === owner.toLowerCase();
  }
}
