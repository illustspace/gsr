import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";
import React, { FunctionComponent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Erc721AssetId } from "@geospatialregistry/sdk";

export interface Erc721AssetProps {
  onChange: (assetId: Erc721AssetId) => void;
}

export const Erc721Asset: FunctionComponent<Erc721AssetProps> = ({
  onChange,
}) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useForm<Erc721AssetId>({
    defaultValues: {
      assetType: "ERC721",
      chainId: 1337,
      contractAddress: "0x06dC8418d1c016302093a3DF39a2584821Cb2939",
      tokenId: "1",
    },
  });

  useEffect(() => {
    onChange(getValues());
  }, [getValues, onChange]);

  return (
    <VStack
      as="form"
      width="100%"
      onChange={() => {
        onChange(getValues());
      }}
    >
      <FormControl isInvalid={!!errors.chainId} isRequired>
        <FormLabel>Chain ID</FormLabel>
        <Input {...register("chainId", { required: true })} />
        <FormHelperText>
          The ID of the chain where the asset is located. For example, Ethereum
          is 1.
        </FormHelperText>

        <FormErrorMessage>{errors.chainId?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.contractAddress} isRequired>
        <FormLabel>Contract Address</FormLabel>
        <Input {...register("contractAddress", { required: true })} />

        <FormHelperText>
          The contract address where the asset is located.
        </FormHelperText>

        <FormErrorMessage>{errors.contractAddress?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.tokenId} isRequired>
        <FormLabel>Token Id</FormLabel>
        <Input {...register("tokenId", { required: true })} isRequired />

        <FormHelperText>The Token ID of the asset.</FormHelperText>

        <FormErrorMessage>{errors.tokenId?.message}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
