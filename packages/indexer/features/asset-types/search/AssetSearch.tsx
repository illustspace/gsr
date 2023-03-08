import React, { FunctionComponent, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  FormHelperText,
  useToast,
  Heading,
  Flex,
  Divider,
} from "@chakra-ui/react";
import {
  ValidatedGsrPlacement,
  GsrIndexerError,
  AssetType,
  ValidationError,
  DecodedAssetId,
  GeohashBits,
} from "@geospatialregistry/sdk";
import NextLink from "next/link";

import { gsr } from "~/features/gsr/gsr-contract";
import { gsrIndexer } from "~/features/gsr/gsr-indexer";
import { getErrorMessage } from "~/features/layout/getErrorMessage";
import { PlacementMap } from "~/features/map/PlacementMap";
import { AssetTypeEntry } from "./AssetTypeEntry";
import { PlaceForm } from "./PlaceForm";

export type AssetSearchProps = Record<never, never>;

export const AssetSearch: FunctionComponent<AssetSearchProps> = () => {
  const [placement, setPlacement] = useState<ValidatedGsrPlacement | null>(
    null
  );
  const [sceneUri, setSceneUri] = useState("");
  const [newLocation, setNewLocation] = useState<GeohashBits | null>(null);

  const [assetType, setAssetType] = useState<AssetType>("MESSAGE");
  const [assetId, setAssetId] = useState<DecodedAssetId>({
    assetType: "MESSAGE",
    message: "",
    publisherAddress: "",
    placementNumber: 1,
  });

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const toast = useToast({
    isClosable: true,
  });

  const setSearchError = (description: string) => {
    toast({
      title: "Search Error",
      description,
      status: "error",
    });
  };

  const handleSearch = async () => {
    if (!gsr) return;

    setPlacement(null);
    setHasSearched(false);
    setIsSearching(true);

    try {
      const decodedAssetId = gsr.parseAssetId(assetId);
      const placement = await gsrIndexer.placeOf(decodedAssetId);
      setPlacement(placement);
      setSceneUri(placement.sceneUri || "");
      setHasSearched(true);
    } catch (e) {
      if (e instanceof GsrIndexerError) {
        if (e.code === "NO_PLACEMENT") {
          setHasSearched(true);
        } else {
          setSearchError(e.message);
          setHasSearched(false);
        }
      } else if (e instanceof ValidationError) {
        setSearchError(e.message);
      } else {
        setSearchError(getErrorMessage(e));
      }
      setPlacement(null);
      setSceneUri("");
    }

    setIsSearching(false);
  };

  return (
    <VStack flexBasis={["100%", "50%", "360px"]} mb={3}>
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

        <FormHelperText>
          Choose the type of asset you want to search for or place.
        </FormHelperText>
      </FormControl>

      <AssetTypeEntry assetType={assetType} onChange={setAssetId} />

      <Button
        width="100%"
        onClick={handleSearch}
        flexShrink={0}
        isLoading={isSearching}
      >
        Search for Existing Placement
      </Button>

      {hasSearched && (
        <>
          <Divider />

          <Flex justifyContent="space-between" width="100%">
            <Heading as="h3" size="lg">
              {placement ? "Edit Placement" : "New Placement"}
            </Heading>

            {placement && (
              <NextLink
                href={gsrIndexer.explorer.asset(placement.assetId)}
                passHref
              >
                <Button as="a" mt={3} mr={3}>
                  View Placement
                </Button>
              </NextLink>
            )}
          </Flex>

          <PlacementMap
            placement={placement}
            width="100%"
            height="100%"
            onLocationChange={setNewLocation}
          />

          <PlaceForm
            decodedAssetId={assetId}
            newLocation={newLocation}
            sceneUri={sceneUri}
            onSceneUriChange={setSceneUri}
          />
        </>
      )}
    </VStack>
  );
};
