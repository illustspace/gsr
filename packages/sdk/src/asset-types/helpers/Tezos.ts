import { TezosToolkit } from "@taquito/taquito";

// Verify Tezos balance for a given token and owner
// Throws an error if the balance is not enough
// Resolves if the balance is enough
interface verifyBalanceProps {
  chainId: string;
  contract: string;
  owner: string;
  tokenId: string;
  amount: string;
}

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

// Verify's if the publisher address is a valid Tezos alias account
// Throws an error if the address is not a valid alias account
// Resolves if the address is a valid alias account
interface verifyAliasAddressProps {
  chainId: string;
  evmAlias: string;
  publisher: string;
}

export async function verifyAliasAddress({
  chainId,
  evmAlias,
  publisher,
}: verifyAliasAddressProps): Promise<void> {
  const Tezos = new TezosToolkit(chainIdToRpc(chainId));

  // Tezos FA2EVMAuth Wallet contract
  const Contract = await Tezos.wallet.at(
    chainIdToAliasAccountContract(chainId)
  );

  // Call contract view to check if EVM Alias address is linked to publisher
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
      return "KT1ACTjebZPDFCvEbDHfiim4go22Dc6M5ARh";
    case "jakartanet":
      return "KT1Gqg1UpLQ8fadjCoQqEKNX5brbM5MVfvFL";
    default:
      throw new Error("Invalid network");
  }
}
