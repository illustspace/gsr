import React, { FunctionComponent, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  AssetId,
  bitsToGeohash,
  ValidatedGsrPlacement,
  GsrIndexerError,
  GeohashBits,
  AssetType,
} from "@geospatialregistry/sdk";

import { PlacementMap } from "~/features/map/PlacementMap";
import { gsr } from "~/features/gsr/gsr-contract";
import { gsrIndexer } from "~/features/gsr/gsr-indexer";
import { AssetTypeEntry } from "./AssetTypeEntry";
import { getProvider } from "../../providers/getProvider";

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

    const decodedAssetId = gsr.parseAssetId(assetId);

    try {
      const placement = await gsrIndexer.placeOf(decodedAssetId);
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

  const handlePlace = async () => {
    const provider = await getProvider();

    if (!gsr || !provider || !newLocation) return;

    setSuccessMessage("");

    try {
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
    <VStack>
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
          <NextLink
            href={gsrIndexer.explorer.asset(placement.assetId)}
            passHref
          >
            <Button as="a">View</Button>
          </NextLink>
        </Text>
      )}

      <Button onClick={handleSearch}>Search</Button>
      <Button onClick={handlePlace}>Place</Button>
      <Button onClick={handlePlaceWithMetaTx}>
        Place With MetaTransaction
      </Button>
    </VStack>
  );
};
