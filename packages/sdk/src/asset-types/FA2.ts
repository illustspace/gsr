import { defaultAbiCoder } from "@ethersproject/abi";
import { object, string, Asserts } from "yup";
import { TezosToolkit } from "@taquito/taquito";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";
import { transformBigNumberToDecimalString } from "./schema";

/** Validation schema for ERC721 */
const schema = object({
  assetType: string().oneOf(["FA2"]).required(),
  chainId: string().oneOf(["mainnet", "ghostnet", "jakartanet"]).required(),
  contractAddress: string(),
  tokenId: string()
    .transform(transformBigNumberToDecimalString)
    .lowercase()
    .required(),
  publisherAddress: string().required(),
  itemNumber: string().transform(transformBigNumberToDecimalString).required(),
});

/** Decoded AssetId for an TEZOS FA2 1:1 NFT */
export type Fa2AssetId = Asserts<typeof schema>;

const assetTypeAbis = {
  collectionId: ["string", "string", "uint256"],
  itemId: ["string", "string"],
};

export class Fa2Verifier extends BaseAssetTypeVerifier<Fa2AssetId> {
  single = false;
  assetType = "FA2" as const;
  schema = schema;

  decodeAssetId(assetId: EncodedAssetId): Fa2AssetId {
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

  encodeAssetId(assetId: Fa2AssetId) {
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
  }: GsrPlacement<Fa2AssetId>): Promise<boolean> {
    try {
      await verifyBalance({
        chainId: decodedAssetId.chainId,
        contract: decodedAssetId.contractAddress as string,
        owner: decodedAssetId.publisherAddress,
        tokenId: Number(decodedAssetId.tokenId),
        amount: Number(decodedAssetId.itemNumber),
      });

      //  verify that the tezos address is alias with the publisher
      await verifyAliasAddress({
        chainId: decodedAssetId.chainId,
        publisher: decodedAssetId.publisherAddress,
        evmAlias: publisher,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

interface verifyBalanceProps {
  chainId: string;
  contract: string;
  owner: string;
  tokenId: number;
  amount: number;
}

// returns number of tokens owned by owner
export async function verifyBalance({
  chainId,
  contract,
  owner,
  tokenId,
  amount,
}: verifyBalanceProps): Promise<void> {
  const Tezos = new TezosToolkit(chainIdToRpc(chainId));

  // Get balance of a user
  const tezContract = await Tezos.contract.at(contract);

  const balance = await tezContract.views
    .balance_of([{ owner, token_id: tokenId }])
    .read();
  // throw error if balance is less than amount
  if (balance[0].balance < amount) {
    throw new Error("Balance too low");
  }
}

interface verifyAliasAddressProps {
  chainId: string;
  evmAlias: string;
  publisher: string;
}

// returns number of tokens owned by publisher
export async function verifyAliasAddress({
  chainId,
  evmAlias,
  publisher,
}: verifyAliasAddressProps): Promise<void> {
  const Tezos = new TezosToolkit(chainIdToRpc(chainId));
  // Tezos EVM Alias Wallet contract
  const Contract = await Tezos.wallet.at(
    chainIdToAliasAccountContract(chainId)
  );

  // Check if EVM Alias address is linked to publisher
  await Contract.contractViews
    .check_alias_address([publisher, evmAlias])
    .executeView({ viewCaller: publisher });
}

function chainIdToRpc(network: string): string {
  switch (network) {
    case "mainnet":
      return "https://mainnet.smartpy.io";
    case "ghostnet":
      return "https://ghostnet.smartpy.io";
    case "jakartanet":
      return "https://jakartanet.smartpy.io";
    default:
      throw new Error("Invalid network");
  }
}

function chainIdToAliasAccountContract(network: string): string {
  switch (network) {
    case "mainnet":
      return "KT1000";
    case "ghostnet":
      return "KT1001";
    case "jakartanet":
      return "KT1Gqg1UpLQ8fadjCoQqEKNX5brbM5MVfvFL";
    default:
      throw new Error("Invalid network");
  }
}
