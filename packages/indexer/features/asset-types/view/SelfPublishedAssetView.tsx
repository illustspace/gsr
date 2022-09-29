import React, { FunctionComponent } from "react";
import { Td, Th, Tr } from "@chakra-ui/react";

import { SelfPublishedAssetId } from "@geospatialregistry/sdk";

export interface SelfPublishedAssetViewProps {
  decodedAssetId: SelfPublishedAssetId;
}

export const SelfPublishedAssetView: FunctionComponent<
  SelfPublishedAssetViewProps
> = ({ decodedAssetId }) => {
  return (
    <>
      <Tr>
        <Th>Asset Type</Th>
        <Td>{decodedAssetId.assetType}</Td>
      </Tr>
      <Tr>
        <Th>Publisher</Th>
        <Td>{decodedAssetId.publisherAddress}</Td>
      </Tr>
      <Tr>
        <Th>Asset Hash</Th>
        <Td>{decodedAssetId.assetHash}</Td>
      </Tr>
    </>
  );
};
