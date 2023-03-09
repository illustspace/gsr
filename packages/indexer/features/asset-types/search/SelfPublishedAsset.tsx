import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
        <FormLabel>Unique ID</FormLabel>
        <Input {...register("assetHash", { required: true })} />

        <FormHelperText>
          A unique ID for this placement. It can be any number. It is used to
          uniquely identify this placement.
        </FormHelperText>

        <FormErrorMessage>{errors.assetHash?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.publisherAddress} isRequired>
        <FormLabel>Publisher Address</FormLabel>
        <InputGroup>
          <Input {...register("publisherAddress", { required: true })} />
          <Button onClick={handleMyAddress}>My Address</Button>
        </InputGroup>

        <FormHelperText>
          The address of the publisher of this asset. This should probably be
          your address.
          <br />
          This allows multiple publishers to uniquely place the same asset in
          the world.
        </FormHelperText>

        <FormErrorMessage>{errors.publisherAddress?.message}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
