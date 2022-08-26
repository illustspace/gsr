import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

export const ASSET_TYPES = ["ERC721", "ERC1155"] as const;

export type AssetType = typeof ASSET_TYPES[number];

const encodedAssetTypes: Record<AssetType, string> = ASSET_TYPES.reduce(
  (assetTypes, assetType) => {
    // eslint-disable-next-line no-param-reassign
    assetTypes[assetType] = keccak256(toUtf8Bytes(assetType));
    return assetTypes;
  },
  {} as Record<AssetType, string>
);

const decodedAssetTypes: Record<string, AssetType> = Object.entries(
  encodedAssetTypes
).reduce((assetTypes, [assetType, encodedAssetType]) => {
  // eslint-disable-next-line no-param-reassign
  assetTypes[encodedAssetType] = assetType;
  return assetTypes;
}, {});

export const getEncodedAssetType = (assetType: AssetType): string | null => {
  return encodedAssetTypes[assetType] || null;
};

export const getDecodedAssetType = (
  encodedAssetType: string
): AssetType | null => {
  return decodedAssetTypes[encodedAssetType] || null;
};
