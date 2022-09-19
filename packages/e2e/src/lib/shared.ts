import { Contract, ContractReceipt } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { GsrIndexer, GsrContract } from "@geospatialregistry/sdk";

import { abi as testTokenAbi } from "../artifacts/contracts/test/Erc721.sol/TestToken.json";

/** chainId for the GSR contract */
export const chainId = 1337;

export const gsrIndexer = new GsrIndexer(chainId, {
  customIndexerUrl: "http://localhost:3001/api",
});
// owner1 = EthWallet.fromPrivateKey("");
export const gsr = new GsrContract(
  {},
  {
    chainId,
    indexer: gsrIndexer,
  }
);

export const provider = getDefaultProvider("http://127.0.0.1:8545/");

const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const testPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const signer = new Wallet(testPrivateKey, provider);

export const erc721 = new Contract(tokenAddress, testTokenAbi, gsr.gsrProvider);

export const getTimestampOfReceipt = async (receipt: ContractReceipt) => {
  const { blockHash } = receipt;
  const block = await gsr.gsrProvider.getBlock(blockHash);
  return block.timestamp;
};
