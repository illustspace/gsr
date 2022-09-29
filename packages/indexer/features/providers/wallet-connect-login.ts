// import type WalletConnectProvider from "@walletconnect/web3-provider";
import type WalletConnectProvider from "@walletconnect/web3-provider";
import { Web3Provider } from "@ethersproject/providers";

import { getAlchemyRpcUrl } from "../eth/alchemy";
import { LoginDetails } from "./LoginDetails";
import { getEnv } from "../config/env";

export const getWalletConnectCredentials = async (
  WalletConnect: typeof WalletConnectProvider | null
): Promise<LoginDetails> => {
  if (!WalletConnect) {
    // You should never hit this, because the button is disabled until
    // wallet connect is loaded.
    throw new Error("Wallet Connect is loading, please wait");
  }

  const walletConnect = initializeWalletConnect(WalletConnect);

  try {
    await walletConnect.close();
  } catch (e) {
    console.error("disconnect error", e);
  }
  await walletConnect.enable();

  const provider = new Web3Provider(walletConnect);

  return {
    provider,
    account: await provider.getSigner().getAddress(),
    disconnect: () => walletConnect.close(),
  };
};

/** Lazy-load the wallet connect library */
export const getWalletConnect = async () => {
  const { default: WalletConnectProvider } = await import(
    "@walletconnect/web3-provider"
  );

  return WalletConnectProvider;
};

/** Initialize a wallet connect instance. */
export const initializeWalletConnect = (
  WalletConnect: typeof WalletConnectProvider
) => {
  return new WalletConnect({
    infuraId: getEnv("infuraId"),
    rpc: {
      137: getAlchemyRpcUrl(137),
      80001: getAlchemyRpcUrl(80001),
    },
  });
};
