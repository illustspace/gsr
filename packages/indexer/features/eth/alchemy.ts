import { getEnv } from "../config/env";
import { chainIds } from "./chain-ids";

const chainApis: Record<number, string> = {
  // ETH Mainnet
  [chainIds.eth.mainnet]: "https://eth-mainnet.g.alchemy.com/v2",
  // Ropsten
  [chainIds.eth.ropsten]: "https://eth-ropsten.g.alchemy.com/v2",
  // Rinkeby
  [chainIds.eth.rinkeby]: "https://eth-rinkeby.g.alchemy.com/v2",
  // Polygon Mainnet
  [chainIds.polygon.mainnet]: "https://polygon-mainnet.g.alchemy.com/v2",
  // Polygon Mumbai
  [chainIds.polygon.mumbai]: "https://polygon-mumbai.g.alchemy.com/v2",
};

/** Get the alchemy RPC url for a chainId */
export const getAlchemyRpcUrl = (chainId: number) => {
  const apiHost = chainApis[chainId] || chainApis[1];
  const alchemyApiKey = getEnv("alchemyApiKey");

  return `${apiHost}/${alchemyApiKey}`;
};
