import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  VStack,
} from "@chakra-ui/react";
import React, { FunctionComponent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { SelfPublishedAssetId } from "@geospatialregistry/sdk";

import { getProvider } from "~/features/providers/getProvider";

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
    setValue,
  } = useForm<SelfPublishedAssetId>({
    defaultValues: {
      assetType: "SELF_PUBLISHED",
      assetHash: "",
      publisherAddress: "",
    },
  });

  useEffect(() => {
    onChange(getValues());
  }, [getValues, onChange]);

  const handleMyAddress = async () => {
    const provider = await getProvider();

    setValue("publisherAddress", await provider.getSigner().getAddress());

    onChange(getValues());
  };

  return (
    <VStack
      width="100%"
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
        <FormLabel>Publisher Address</FormLabel>
        <InputGroup>
          <Input {...register("publisherAddress", { required: true })} />
          <Button onClick={handleMyAddress}>My Address</Button>
        </InputGroup>

        <FormErrorMessage>{errors.publisherAddress?.message}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
