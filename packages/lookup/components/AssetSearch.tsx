import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
} from "@chakra-ui/react";
import { BigNumber } from "@ethersproject/bignumber";
import { Web3Provider } from "@ethersproject/providers";
import { useForm } from "react-hook-form";
// import { geohashForLocation } from "geofire-common";

import { AssetId, bitsToGeohash, geohashToBits, GsrContract } from "@gsr/sdk";
import { Erc721AssetId } from "@gsr/sdk/lib/cjs/asset-types";

import { getInjectedCredentials } from "~/features/providers/injected-login";
import { getEnv } from "~/features/config/env";

import { PlacementMap } from "./PlacementMap";

interface PlaceOfReturn {
  geohash: BigNumber;
  bitPrecision: number;
}

export type AssetSearchProps = Record<never, never>;

interface AssetSearchForm {
  assetType: "ERC721";
  chainId: string;
  collectionId: string;
  tokenId: string;
  publisher: string;
}

export const AssetSearch: FunctionComponent<AssetSearchProps> = () => {
  const [txError, setTxError] = useState("");
  const [placement, setPlacement] = useState<PlaceOfReturn | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<AssetSearchForm>({
    defaultValues: {
      assetType: "ERC721",
      chainId: "1",
      collectionId: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      tokenId: "1",
      publisher: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    },
  });

  const provider = useProvider();
  const gsr = useGsr();

  console.log("hi");

  const handleSearch = handleSubmit(async (form) => {
    if (!gsr) return;

    const assetId = assetIdFromForm(form);

    console.log("assetId", assetId);

    setTxError("");
    setPlacement(null);

    try {
      const placement = await gsr.placeOf(assetId, form.publisher);
      setPlacement(placement);
    } catch (e) {
      const error = e as Error;
      if (error.message.includes("GSR: Asset not published")) {
        setTxError("Asset not published");
      } else {
        setTxError("Error getting asset");
      }
    }
  });

  // const handleMint = () =>{}

  const handlePlace = async () => {
    if (!gsr || !provider) return;

    const assetId = assetIdFromForm(getValues());

    try {
      const tx = await gsr.place(
        provider?.getSigner(),
        assetId,
        {
          geohash: geohashToBits("9q5c21zfq5"),
          bitPrecision: 50,
        },
        {
          timeRange: { start: 0, end: 0 },
        }
      );

      await tx.wait();
    } catch (e) {
      const error = e as Error;

      console.error(error);
    }
  };

  return (
    <VStack>
      <FormControl isInvalid={!!errors.assetType} isRequired>
        <FormLabel>Asset Type</FormLabel>

        <Select {...register("assetType", { required: true })}>
          <option value="ERC721">ERC721</option>
          <option value="ERC1155">ERC1155</option>
        </Select>

        <FormErrorMessage>{errors.assetType?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.chainId} isRequired>
        <FormLabel>Chain ID</FormLabel>
        <Input {...register("chainId", { required: true })} />

        <FormErrorMessage>{errors.chainId?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.collectionId} isRequired>
        <FormLabel>Contract Address</FormLabel>
        <Input {...register("collectionId", { required: true })} />

        <FormErrorMessage>{errors.collectionId?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.tokenId} isRequired>
        <FormLabel>Token Id</FormLabel>
        <Input {...register("tokenId", { required: true })} isRequired />

        {errors.tokenId?.message}

        <FormErrorMessage>{errors.tokenId?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.publisher} isRequired>
        <FormLabel>Owner Address</FormLabel>
        <Input {...register("publisher", { required: true })} />

        <FormErrorMessage>{errors.publisher?.message}</FormErrorMessage>
      </FormControl>

      {placement && (
        <PlacementMap placement={placement} width="100%" height="200px" />
      )}

      {txError && <Text color="red">{txError}</Text>}

      {placement && (
        <Text>
          Placement:{" "}
          {bitsToGeohash(
            placement.geohash.toNumber(),
            placement.bitPrecision / 5
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

const useGsr = () => {
  return useMemo(() => {
    return new GsrContract(
      {
        infura: getEnv("infuraId"),
        alchemy: getEnv("alchemyApiKey"),
      },
      {
        chainId: getEnv("gsrChainId"),
      }
    );
  }, []);
};

const assetIdFromForm = (form: AssetSearchForm): AssetId => {
  const assetType = "ERC721";
  const chainId = Number(form.chainId);
  const contractAddress = form.collectionId;
  const tokenId = form.tokenId;

  const decodedAssetId: Erc721AssetId = {
    assetType,
    chainId,
    contractAddress,
    tokenId,
  };

  return decodedAssetId;
};
