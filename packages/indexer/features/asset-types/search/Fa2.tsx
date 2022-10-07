import {
  Box,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  Link,
} from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Fa2AssetId } from "@geospatialregistry/sdk";

export interface Fa2AssetProps {
  onChange: (assetId: Fa2AssetId) => void;
}

export const Fa2Asset: FunctionComponent<Fa2AssetProps> = ({ onChange }) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useForm<Fa2AssetId>({
    defaultValues: {
      assetType: "FA2",
      chainId: "jakartanet",
      contractAddress: "KT1Gqg1UpLQ8fadjCoQqEKNX5brbM5MVfvFL",
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
          For FA2, enter the item number you wish to place. This number may not
          be higher than the number of the given asset you currently own. For
          instance, if you own three copies of this asset, you may place it up
          to three times.
        </FormHelperText>

        <FormErrorMessage>{errors.itemNumber?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.publisherAddress} isRequired>
        <FormLabel>Tezos Publisher</FormLabel>

        <FormHelperText>
          Use{" "}
          <Link
            href="https://better-call.dev/jakartanet/KT1Fk4pZAXDgLwzahLnrZwTRgKWd5Nc4RoTX/interact/mint"
            target="_blank"
            color="blue.500"
            textDecoration="underline"
          >
            Mint a Tezos EVM Alias Account Registry Contract
          </Link>{" "}
          The address of the Tezos wallet which holds the NFT Token you wish to
          place. This address must be registered as an alias account with the
          current EVM wallet to be a verified publisher.
        </FormHelperText>

        <InputGroup>
          <Input
            {...register("publisherAddress", { required: true })}
            isRequired
          />
        </InputGroup>

        <FormErrorMessage>
          The address of the current Tezos owner of the FA2 asset. FA2
          placements are unique per owner.
        </FormErrorMessage>

        <FormErrorMessage>{errors.publisherAddress?.message}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};
