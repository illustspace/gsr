import React, { FunctionComponent } from "react";
import { Td, Th, Tr } from "@chakra-ui/react";

import { Erc1155AssetId } from "@geospatialregistry/sdk";
import { chainIdToName } from "~/features/eth/chain-ids";

export interface Erc1155AssetViewProps {
  decodedAssetId: Erc1155AssetId;
}

export const Erc1155AssetView: FunctionComponent<Erc1155AssetViewProps> = ({
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
        <Td>
          {chainIdToName[decodedAssetId.chainId] || decodedAssetId.chainId}
        </Td>
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
