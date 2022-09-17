import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Erc721AssetId } from "~/../sdk/lib/cjs";

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

  return (
    <Box
      as="form"
      onChange={() => {
        onChange(getValues());
      }}
    >
      <FormControl isInvalid={!!errors.chainId} isRequired>
        <FormLabel>Chain ID</FormLabel>
        <Input {...register("chainId", { required: true })} />

        <FormErrorMessage>{errors.chainId?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.contractAddress} isRequired>
        <FormLabel>Contract Address</FormLabel>
        <Input {...register("contractAddress", { required: true })} />

        <FormErrorMessage>{errors.contractAddress?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.tokenId} isRequired>
        <FormLabel>Token Id</FormLabel>
        <Input {...register("tokenId", { required: true })} isRequired />

        {errors.tokenId?.message}

        <FormErrorMessage>{errors.tokenId?.message}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};
