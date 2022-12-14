import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Erc1155AssetId } from "@geospatialregistry/sdk";

export interface Erc1155AssetProps {
  onChange: (assetId: Erc1155AssetId) => void;
}

export const Erc1155Asset: FunctionComponent<Erc1155AssetProps> = ({
  onChange,
}) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useForm<Erc1155AssetId>({
    defaultValues: {
      assetType: "ERC1155",
      chainId: 1337,
      contractAddress: "0x06dC8418d1c016302093a3DF39a2584821Cb2939",
      tokenId: "1",
      itemNumber: "1",
      publisherAddress: "",
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

        <FormErrorMessage>{errors.tokenId?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.itemNumber} isRequired>
        <FormLabel>Item Number</FormLabel>
        <Input {...register("itemNumber", { required: true })} isRequired />

        <FormHelperText>
          For ERC-1155, enter the item number you wish to place. This number may
          not be higher than the number of the given asset you currently own.
          For instance, if you own three copies of this asset, you may place it
          up to three times.
        </FormHelperText>

        <FormErrorMessage>{errors.itemNumber?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.publisherAddress} isRequired>
        <FormLabel>Publisher</FormLabel>

        <InputGroup>
          <Input
            {...register("publisherAddress", { required: true })}
            isRequired
          />

          <Button>My Address</Button>
        </InputGroup>

        <FormErrorMessage>
          The address of the current owner of the asset. 1155 placements are
          unique per owner.
        </FormErrorMessage>

        <FormErrorMessage>{errors.publisherAddress?.message}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};
