import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import React, { FunctionComponent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MessageAssetId } from "@geospatialregistry/sdk";

import { getProvider } from "~/features/providers/getProvider";

export interface MessageAssetProps {
  onChange: (assetId: MessageAssetId) => void;
}

export const MessageAssetSearch: FunctionComponent<MessageAssetProps> = ({
  onChange,
}) => {
  const {
    register,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<MessageAssetId>({
    defaultValues: {
      assetType: "MESSAGE",
      message: "",
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
      <FormControl isInvalid={!!errors.message} isRequired>
        <FormLabel>Message</FormLabel>
        <Textarea {...register("message", { required: true })} />

        <FormHelperText>
          The message you want to place in the world.
          <br />
          This will be written on-chain, and is included in the unique ID of the
          placement.
        </FormHelperText>

        <FormErrorMessage>{errors.message?.message as string}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.publisherAddress} isRequired>
        <FormLabel>Publisher Address</FormLabel>
        <InputGroup>
          <Input {...register("publisherAddress", { required: true })} />
          <Button onClick={handleMyAddress}>My Address</Button>
        </InputGroup>

        <FormHelperText>
          The address of the publisher of this message. This should probably be
          your address.
          <br />
          This allows multiple publishers to uniquely place the same message in
          the world.
        </FormHelperText>

        <FormErrorMessage>
          {errors.publisherAddress?.message as string}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.placementNumber} isRequired>
        <FormLabel>Placement Number</FormLabel>
        <Input {...register("placementNumber", { required: true })} />

        <FormHelperText>
          A number that uniquely identifies this placement of this message.
          <br />
          Increase this number to create a new placement of the same message
          text.
        </FormHelperText>

        <FormErrorMessage>
          {errors.placementNumber?.message as string}
        </FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
