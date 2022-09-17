import React, { FunctionComponent } from "react";
import { AssetId, AssetType } from "~/../sdk/lib/cjs";
import { Erc1155Asset } from "./Erc1155Asset";
import { Erc721Asset } from "./Erc721Asset";
import { MessageAssetSearch } from "./MessageAssetSearch";
import { SelfPublishedAsset } from "./SelfPublishedAsset";

export interface AssetTypeEntryProps {
  assetType: AssetType;
  onChange: (assetId: AssetId) => void;
}

/** Entry form for all known asset types */
export const AssetTypeEntry: FunctionComponent<AssetTypeEntryProps> = ({
  assetType,
  onChange,
}) => {
  if (assetType === "ERC721") {
    return <Erc721Asset onChange={onChange} />;
  } else if (assetType === "ERC1155") {
    return <Erc1155Asset onChange={onChange} />;
  } else if (assetType === "SELF_PUBLISHED") {
    return <SelfPublishedAsset onChange={onChange} />;
  } else if (assetType === "MESSAGE") {
    return <MessageAssetSearch onChange={onChange} />;
  } else {
    return null;
  }
};
