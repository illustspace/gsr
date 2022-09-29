import React, { FunctionComponent } from "react";
import { Td, Th, Tr } from "@chakra-ui/react";

import { Erc721AssetId } from "@geospatialregistry/sdk";
import { chainIdToName } from "~/features/eth/chain-ids";

export interface Erc721AssetViewProps {
  decodedAssetId: Erc721AssetId;
}

export const Erc721AssetView: FunctionComponent<Erc721AssetViewProps> = ({
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
    </>
  );
};
