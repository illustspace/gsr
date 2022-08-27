import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import {
  AlchemyProvider,
  getDefaultProvider,
  getNetwork,
} from "@ethersproject/providers";

/** API Keys for data sources used to fetch asset data */
export interface ProviderKeys {
  /** Infura API key */
  infura?: string;
  /** Alchemy API key */
  alchemy?: string;
}

/** Get a provider for a given chainId */
export const getChainProvider = (
  chainId: BigNumberish,
  providerKeys: ProviderKeys
) => {
  const chainIdNumber = BigNumber.from(chainId).toNumber();

  if (chainIdNumber === 1337) {
    return getDefaultProvider("http://127.0.0.1:8545/");
  } else {
    if (!providerKeys.alchemy) {
      throw new Error(`Alchemy key required for chain ${chainId}`);
    }

    return new AlchemyProvider(getNetwork(chainIdNumber), providerKeys.alchemy);
  }
};
