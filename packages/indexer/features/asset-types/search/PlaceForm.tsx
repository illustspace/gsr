import React, { FunctionComponent } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import { DecodedAssetId, GeohashBits } from "@geospatialregistry/sdk";
import { hexValue } from "@ethersproject/bytes";
import {
  ExternalProvider,
  JsonRpcSigner,
  Web3Provider,
} from "@ethersproject/providers";

import { gsr } from "~/features/gsr/gsr-contract";
import { gsrIndexer } from "~/features/gsr/gsr-indexer";
import { getProvider } from "~/features/providers/getProvider";
import { getErrorMessage } from "~/features/layout/getErrorMessage";

export interface PlaceFormProps {
  decodedAssetId: DecodedAssetId;
  sceneUri: string;
  newLocation: GeohashBits | null;
  onSceneUriChange: (sceneUri: string) => void;
}

export const PlaceForm: FunctionComponent<PlaceFormProps> = ({
  decodedAssetId,
  sceneUri,
  newLocation,
  onSceneUriChange,
}) => {
  const toast = useToast({
    isClosable: true,
  });

  const setTxError = (description: string) => {
    toast({
      title: "Failed to place asset",
      description,
      status: "error",
    });
  };

  const setSuccessMessage = (title: string) => {
    toast({
      title,
      status: "success",
    });
  };

  const handlePlace = async () => {
    const provider = await getProvider();

    if (!provider) return;

    if (!newLocation) {
      setTxError("No location selected");
      return;
    }

    try {
      const signer = provider.getSigner();
      await ensureChain(signer);

      const { sync } = await gsr.place(signer, decodedAssetId, newLocation, {
        timeRange: { start: 0, end: 0 },
        sceneUri,
      });

      await sync;

      setSuccessMessage("Asset placed");
    } catch (e) {
      const error = e as Error;

      console.error(error);

      setTxError(getErrorMessage(e));
    }
  };

  const handlePlaceWithMetaTx = async () => {
    const provider = await getProvider();

    if (!gsr || !provider || !newLocation) return;

    try {
      const metaTx = await gsr.placeWithMetaTransaction(
        provider.getSigner(),
        decodedAssetId,
        newLocation,
        {
          sceneUri,
          timeRange: { start: 0, end: 0 },
        }
      );

      const txHash = await gsrIndexer.executeMetaTransaction(metaTx);

      const { sync } = await gsr.syncAfterTransactionHash(txHash);
      await sync;

      setSuccessMessage("Asset placed");
    } catch (e) {
      const error = e as Error;
      console.error("metatx error", error);
      setTxError(getErrorMessage(e));
    }
  };

  return (
    <Box width="100%">
      <FormControl>
        <FormLabel>Scene URI</FormLabel>
        <Input
          value={sceneUri}
          onChange={(e) => onSceneUriChange(e.target.value)}
        />

        <FormHelperText>Optional Scene URI</FormHelperText>
      </FormControl>

      <ButtonGroup width="100%" mt={3}>
        <Button width="50%" onClick={handlePlace}>
          Place
        </Button>
        <Button width="50%" onClick={handlePlaceWithMetaTx}>
          Place with <br />
          MetaTransaction
        </Button>
      </ButtonGroup>
    </Box>
  );
};

/** Ensure the user is on the correct chain. */
const ensureChain = async (signer: JsonRpcSigner) => {
  if (!signer) {
    throw new Error("No signer");
  }

  const gsrChainId = gsrIndexer.chainId;

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
          "Please switch to the Polygon network to publish with the GSR."
        );
      }
    } else {
      throw new Error(
        "Please switch to the Polygon network to publish with the GSR."
      );
    }
  }
};

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
