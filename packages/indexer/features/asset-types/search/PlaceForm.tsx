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
