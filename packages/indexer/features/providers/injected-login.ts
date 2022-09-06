import { Web3Provider } from "@ethersproject/providers";

import { getEthereum } from "~/features/eth/ethereum";
import { LoginDetails } from "./LoginDetails";

export const getInjectedCredentials = async (
  network?: number
): Promise<LoginDetails> => {
  const ethereum = getEthereum();

  if (!ethereum) {
    throw new Error("injected web3 not available");
  }

  // Connect to metamask.
  await ethereum.request?.({
    method: "eth_requestAccounts",
  });

  const provider = new Web3Provider(ethereum, network);

  return {
    provider,
    account: await provider.getSigner().getAddress(),
    disconnect: () => Promise.resolve(),
  };
};
