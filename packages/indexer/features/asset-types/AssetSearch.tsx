import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
// import { geohashForLocation } from "geofire-common";

import {
  AssetId,
  bitsToGeohash,
  ValidatedGsrPlacement,
  GsrIndexerError,
  GeohashBits,
  AssetType,
} from "@geospatialregistry/sdk";

import { getInjectedCredentials } from "~/features/providers/injected-login";
import { getEnv } from "~/features/config/env";

import { PlacementMap } from "~/features/map/PlacementMap";
import { gsr } from "~/features/gsr/gsr-contract";
import { gsrIndexer } from "~/features/gsr/gsr-indexer";
import { AssetTypeEntry } from "./AssetTypeEntry";

export type AssetSearchProps = Record<never, never>;

export const AssetSearch: FunctionComponent<AssetSearchProps> = () => {
  const [txError, setTxError] = useState("");
  const [placement, setPlacement] = useState<ValidatedGsrPlacement | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState("");

  const [newLocation, setNewLocation] = useState<GeohashBits | null>(null);

  const [assetType, setAssetType] = useState<AssetType>("ERC721");
  const [assetId, setAssetId] = useState<AssetId>({
    assetType: "ERC721",
    chainId: 1337,
    contractAddress: "0x06dC8418d1c016302093a3DF39a2584821Cb2939",
    tokenId: "1",
  });

  const provider = useProvider();

  const handleSearch = async () => {
    if (!gsr) return;

    setTxError("");
    setPlacement(null);

    try {
      const placement = await gsrIndexer.placeOf(assetId);
      setPlacement(placement);
    } catch (e) {
      if (e instanceof GsrIndexerError) {
        setTxError(e.message);
      } else {
        setTxError("Error getting asset");
      }
      setPlacement(null);
    }
  };

  // const handleMint = () =>{}

  const handlePlace = async () => {
    if (!gsr || !provider || !newLocation) return;

    setSuccessMessage("");

    try {
      const { sync } = await gsr.place(
        provider?.getSigner(),
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
    }
  };

  return (
    <VStack>
      <FormControl isRequired>
        <FormLabel>Asset Type</FormLabel>

        <Select
          value={assetType}
          onChange={(event) => setAssetType(event.target.value as AssetType)}
          isRequired
        >
          <option value="ERC721">ERC721</option>
          <option value="ERC1155">ERC1155</option>
          <option value="SELF_PUBLISHED">Self Published</option>
        </Select>
      </FormControl>

      <AssetTypeEntry assetType={assetType} onChange={setAssetId} />

      {/* <FormControl>
        <FormLabel>Alternative Publisher Address</FormLabel>
        <Input {...register("publisher")} />

        <FormErrorMessage>{errors.publisher?.message}</FormErrorMessage>
      </FormControl> */}

      <PlacementMap
        placement={placement}
        width="100%"
        height="200px"
        onLocationChange={setNewLocation}
      />

      {txError && <Text color="red">{txError}</Text>}
      {successMessage && <Text color="green">{successMessage}</Text>}

      {placement && (
        <Text>
          Placement:{" "}
          {bitsToGeohash(
            placement.location.geohash,
            placement.location.bitPrecision / 5
          )}
        </Text>
      )}

      <Button onClick={handleSearch}>Search</Button>
      <Button onClick={handlePlace}>Place</Button>
    </VStack>
  );
};

const useProvider = () => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);

  useEffect(() => {
    getInjectedCredentials(getEnv("gsrChainId")).then(({ provider }) => {
      setProvider(provider);
    });
  }, []);

  return provider;
};
