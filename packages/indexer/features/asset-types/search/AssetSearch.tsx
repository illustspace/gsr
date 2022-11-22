import React, { FunctionComponent, useState } from "react";
import {
  Box,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Text,
  ButtonGroup,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  AssetId,
  bitsToGeohash,
  ValidatedGsrPlacement,
  GsrIndexerError,
  GeohashBits,
  AssetType,
  ValidationError,
} from "@geospatialregistry/sdk";
import { hexValue } from "@ethersproject/bytes";

import { PlacementMap } from "~/features/map/PlacementMap";
import { gsr } from "~/features/gsr/gsr-contract";
import { gsrIndexer } from "~/features/gsr/gsr-indexer";
import { AssetTypeEntry } from "./AssetTypeEntry";
import { getProvider } from "../../providers/getProvider";
import { getEthereum } from "~/features/eth/ethereum";
import { getErrorMessage } from "~/features/layout/getErrorMessage";

export type AssetSearchProps = Record<never, never>;

export const AssetSearch: FunctionComponent<AssetSearchProps> = () => {
  const [txError, setTxError] = useState("");
  const [placement, setPlacement] = useState<ValidatedGsrPlacement | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState("");

  const [newLocation, setNewLocation] = useState<GeohashBits | null>(null);

  const [assetType, setAssetType] = useState<AssetType>("MESSAGE");
  const [assetId, setAssetId] = useState<AssetId>({
    assetType: "MESSAGE",
    message: "",
    publisherAddress: "",
    placementNumber: 1,
  });

  const handleSearch = async () => {
    if (!gsr) return;

    setTxError("");
    setPlacement(null);

    try {
      const decodedAssetId = gsr.parseAssetId(assetId);
      const placement = await gsrIndexer.placeOf(decodedAssetId);
      setPlacement(placement);
    } catch (e) {
      if (e instanceof GsrIndexerError) {
        setTxError(e.message);
      } else if (e instanceof ValidationError) {
        setTxError(e.message);
      } else {
        setTxError(getErrorMessage(e));
      }
      setPlacement(null);
    }
  };

  const handlePlace = async () => {
    const provider = await getProvider();

    setSuccessMessage("");

    if (!gsr || !provider) return;

    if (!newLocation) {
      setTxError("No location selected");
      return;
    }

    try {
      await ensureChain();

      const { sync } = await gsr.place(
        provider.getSigner(),
        assetId,
        newLocation,
        {
          timeRange: { start: 0, end: 0 },
        }
      );

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

    setSuccessMessage("");

    try {
      const metaTx = await gsr.placeWithMetaTransaction(
        provider.getSigner(),
        assetId,
        newLocation,
        {
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
    }
  };

  return (
    <Stack direction={["column", "row"]} spacing={4}>
      <VStack flexBasis={["100%", "50%", "360px"]}>
        <FormControl isRequired>
          <FormLabel>Asset Type</FormLabel>

          <Select
            value={assetType}
            onChange={(event) => setAssetType(event.target.value as AssetType)}
            isRequired
          >
            <option value="MESSAGE">Message</option>
            <option value="ERC721">ERC721</option>
            <option value="ERC1155">ERC1155</option>
            <option value="SELF_PUBLISHED">Self Published</option>
          </Select>
        </FormControl>

        <AssetTypeEntry assetType={assetType} onChange={setAssetId} />
      </VStack>

      <Box flex={1}>
        <PlacementMap
          placement={placement}
          width="100%"
          height="300px"
          onLocationChange={setNewLocation}
        />

        <ButtonGroup width="100%" mt={3}>
          <Button width="50%" onClick={handleSearch}>
            Search
          </Button>
          <Button width="50%" onClick={handlePlace}>
            Place
          </Button>
          <Button width="50%" onClick={handlePlaceWithMetaTx}>
            Place with <br />
            MetaTransaction
          </Button>
        </ButtonGroup>

        {txError && (
          <Text color="red" textAlign="center">
            {txError}
          </Text>
        )}
        {successMessage && (
          <Text color="green" textAlign="center">
            {successMessage}
          </Text>
        )}

        {placement && (
          <Text>
            Placement:{" "}
            {bitsToGeohash(
              placement.location.geohash,
              placement.location.bitPrecision / 5
            )}
            <NextLink
              href={gsrIndexer.explorer.asset(placement.assetId)}
              passHref
            >
              <Button as="a">View</Button>
            </NextLink>
          </Text>
        )}
      </Box>
    </Stack>
  );
};

/** Ensure the user is on the correct chain. */
const ensureChain = async () => {
  const ethereum = getEthereum();
  if (!ethereum?.request) return;

  const chainId = hexValue(gsrIndexer.chainId);

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (e) {
    const switchError = e as Error & { code: number };
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId,
            chainName: "Polygon",
            rpcUrls: [chainRpcUrls[gsrIndexer.chainId]],
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://polygonscan.com/"],
          },
        ],
      });
    } else {
      throw e;
    }
  }
};

const chainRpcUrls: Record<number, string> = {
  137: "https://polygon-rpc.com/",
  80001: "https://rpc-mumbai.maticvigil.com",
  1337: "http://127.0.0.1:8545/",
};
