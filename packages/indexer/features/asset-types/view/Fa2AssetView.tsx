import React, { FunctionComponent } from "react";
import { Td, Th, Tr } from "@chakra-ui/react";

import { Fa2AssetId } from "@geospatialregistry/sdk";

export interface Fa2AssetViewProps {
  decodedAssetId: Fa2AssetId;
}

export const Fa2AssetView: FunctionComponent<Fa2AssetViewProps> = ({
  decodedAssetId,
}) => {
  return (
    <>
      <Tr>
        <Th>Asset Type</Th>
        <Td>{decodedAssetId.assetType}</Td>
      </Tr>
      <Tr>
        <Th>Chain</Th>
        <Td>{decodedAssetId.chainId}</Td>
      </Tr>
      <Tr>
        <Th>Contract Address</Th>
        <Td>{decodedAssetId.contractAddress}</Td>
      </Tr>
      <Tr>
        <Th>Token ID</Th>
        <Td>{decodedAssetId.tokenId}</Td>
      </Tr>

      <Tr>
        <Th>Publisher</Th>
        <Td>{decodedAssetId.publisherAddress}</Td>
      </Tr>
      <Tr>
        <Th>Item Number</Th>
        <Td>{decodedAssetId.itemNumber}</Td>
      </Tr>
    </>
  );
};
