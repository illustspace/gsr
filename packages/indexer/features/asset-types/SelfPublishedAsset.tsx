import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { SelfPublishedAssetId } from "~/../sdk/lib/cjs";
import { getProvider } from "../providers/getProvider";

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

  const handleMyAddress = async () => {
    const provider = await getProvider();

    setValue("publisherAddress", await provider.getSigner().getAddress());

    onChange(getValues());
  };

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
        <FormLabel>Publisher Address</FormLabel>
        <InputGroup>
          <Input {...register("publisherAddress", { required: true })} />
          <Button onClick={handleMyAddress}>My Address</Button>
        </InputGroup>

        <FormErrorMessage>{errors.publisherAddress?.message}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};
