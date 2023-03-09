import { Web3Provider } from "@ethersproject/providers";

import { getEthereum } from "~/features/eth/ethereum";
import { LoginDetails } from "./LoginDetails";

export const getInjectedCredentials = async (): Promise<LoginDetails> => {
  const ethereum = getEthereum();

  if (!ethereum) {
    throw new Error("injected web3 not available");
  }

  // Connect to metamask.
  await ethereum.request?.({
    method: "eth_requestAccounts",
  });

  const provider = new Web3Provider(ethereum);

  return {
    provider,
    account: await provider.getSigner().getAddress(),
    disconnect: () => Promise.resolve(),
  };
};
