import { ExternalProvider } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum: any;
  }
}

/** Get a typed version of window.ethereum. */
export const getEthereum = () => {
  if (typeof window === "undefined") {
    throw new Error("window is undefined, can't get injected provider.");
  }
  return window.ethereum as ExternalProvider;
};
