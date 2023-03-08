import { type ExternalProvider, Web3Provider } from "@ethersproject/providers";
import type { Signer } from "ethers";
import { hexValue } from "ethers/lib/utils";

/** Ensure the user's wallet is on the correct chain. */
export async function ensureActiveChain(signer: Signer, gsrChainId: number) {
  if (!signer) {
    throw new Error("No signer");
  }

  // If chain is already correct, do nothing.
  if ((await signer.getChainId()) === gsrChainId) {
    return;
  }

  if (gsrChainId === 1337) {
    throw new Error(
      "Cannot manually switch to devnet. manually switch to chain 1337."
    );
  }

  const externalProvider: ExternalProvider = (signer.provider as any)?.provider;
  if (!externalProvider) return;

  // Get a provider that can request chain changes.
  const ethereum = new Web3Provider(externalProvider).provider;
  if (!ethereum?.request) return;

  const hexChainId = hexValue(gsrChainId);

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if ("code" in switchError && switchError.code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChainId,
              chainName: chainNames[gsrChainId],
              rpcUrls: [chainRpcUrls[gsrChainId]],
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: [chainIdExplorer(gsrChainId)],
            },
          ],
        });
      } catch (addError) {
        throw new Error(
          `Please switch to the ${chainNames[gsrChainId]} network to publish with the GSR.`
        );
      }
    } else {
      throw new Error(
        `Please switch to the ${chainNames[gsrChainId]} network to publish with the GSR.`
      );
    }
  }
}

const chainNames: Record<number, string> = {
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  1337: "Hardhat Network",
};

const chainRpcUrls: Record<number, string> = {
  137: "https://polygon-rpc.com/",
  80001: "https://rpc-mumbai.maticvigil.com",
  1337: "http://127.0.0.1:8545/",
};

/** Look up block explorer by chainId */
export function chainIdExplorer(chainId: number): string {
  if (chainId === 80001) {
    return "https://mumbai.polygonscan.com";
  }
  if (chainId === 137) {
    return "https://polygonscan.com";
  }
  return "";
}
