import React, { FunctionComponent } from "react";
import { DecodedAssetId } from "@geospatialregistry/sdk";
import { Erc721AssetView } from "./Erc721AssetView";
import { Erc1155AssetView } from "./Erc1155AssetView";
import { MessageAssetView } from "./MessageAssetView";
import { SelfPublishedAssetView } from "./SelfPublishedAssetView";

export interface AssetViewProps {
  decodedAssetId: DecodedAssetId;
}

/** A simple table showing a DecodedAssetId */
export const AssetView: FunctionComponent<AssetViewProps> = ({
  decodedAssetId,
}) => {
  switch (decodedAssetId.assetType) {
    case "ERC721": {
      return <Erc721AssetView decodedAssetId={decodedAssetId} />;
    }
    case "ERC1155": {
      return <Erc1155AssetView decodedAssetId={decodedAssetId} />;
    }
    case "SELF_PUBLISHED": {
      return <SelfPublishedAssetView decodedAssetId={decodedAssetId} />;
    }
    case "MESSAGE": {
      return <MessageAssetView decodedAssetId={decodedAssetId} />;
    }
    default: {
      return null;
    }
  }
};
