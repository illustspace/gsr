import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { SelfPublishedAssetId } from "~/../sdk/lib/cjs";

export interface SelfPublishedAssetProps {
  onChange: (assetId: SelfPublishedAssetId) => void;
}

export const SelfPublishedAsset: FunctionComponent<SelfPublishedAssetProps> = ({
  onChange,
}) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useForm<SelfPublishedAssetId>({
    defaultValues: {
      assetType: "SELF_PUBLISHED",
      assetHash: "",
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
      <FormControl isInvalid={!!errors.assetHash} isRequired>
        <FormLabel>Asset Hash</FormLabel>
        <Input {...register("assetHash", { required: true })} />

        <FormErrorMessage>{errors.assetHash?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.publisherAddress} isRequired>
        <FormLabel>Contract Address</FormLabel>
        <Input {...register("publisherAddress", { required: true })} />

        <FormErrorMessage>{errors.publisherAddress?.message}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};
