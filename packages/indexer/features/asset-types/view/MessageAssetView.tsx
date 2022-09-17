import React, { FunctionComponent } from "react";
import { Td, Th, Tr } from "@chakra-ui/react";

import { MessageAssetId } from "@geospatialregistry/sdk";

export interface MessageAssetViewProps {
  decodedAssetId: MessageAssetId;
}

export const MessageAssetView: FunctionComponent<MessageAssetViewProps> = ({
  decodedAssetId,
}) => {
  return (
    <>
      <Tr>
        <Th>Asset Type</Th>
        <Td>{decodedAssetId.assetType}</Td>
      </Tr>
      <Tr>
        <Th>Message</Th>
        <Td>{decodedAssetId.message}</Td>
      </Tr>
      <Tr>
        <Th>Publisher</Th>
        <Td>{decodedAssetId.publisherAddress}</Td>
      </Tr>
    </>
  );
};
