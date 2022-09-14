import type WalletConnectProvider from "@walletconnect/web3-provider";

import { getInjectedCredentials } from "./injected-login";
import { getWalletConnectCredentials } from "./wallet-connect-login";
import { LoginDetails } from "./LoginDetails";

export type LoginOpts = { service: "injected" } | { service: "walletConnect" };

/** Connect to a provider and use that to get what we need to do a firebase login. */
export const getLoginCredentials = async (
  opts: LoginOpts,
  WalletConnect: typeof WalletConnectProvider | null
): Promise<LoginDetails> => {
  if (isWalletConnectLogin(opts)) {
    return getWalletConnectCredentials(WalletConnect);
  }
  if (isInjectedLogin(opts)) {
    return getInjectedCredentials();
  }

  throw new Error("Invalid login service");
};

const isInjectedLogin = (opts: LoginOpts) => {
  return opts.service === "injected";
};

const isWalletConnectLogin = (opts: LoginOpts) => {
  return opts.service === "walletConnect";
};
