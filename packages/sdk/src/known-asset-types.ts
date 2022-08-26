import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

/**
 * @file functions for encoding and decoding asset types
 */

/** Known asset types */
export const ASSET_TYPES = ["ERC721", "ERC1155"] as const;

/** An asset type */
export type AssetType = typeof ASSET_TYPES[number];

/** Mapping from decodedAssetType => encodedAssetType */
const encodedAssetTypes = ASSET_TYPES.reduce((assetTypes, assetType) => {
  // eslint-disable-next-line no-param-reassign
  assetTypes[assetType] = keccak256(toUtf8Bytes(assetType));
  return assetTypes;
}, {} as Record<AssetType, string>);

/** Mapping from encodedAssetType => decodedAssetType  */
const decodedAssetTypes = Object.entries(encodedAssetTypes).reduce(
  (assetTypes, [assetType, encodedAssetType]) => {
    // eslint-disable-next-line no-param-reassign
    assetTypes[encodedAssetType] = assetType as AssetType;
    return assetTypes;
  },
  {} as Record<string, AssetType>
);

/** Get the encoded version of a plain asset type, for use with the GSR */
export const getEncodedAssetType = (assetType: AssetType): string | null => {
  return encodedAssetTypes[assetType] || null;
};

/** Get the plain version of an encoded asset type, for use with the SDK */
export const getDecodedAssetType = (
  encodedAssetType: string
): AssetType | null => {
  return decodedAssetTypes[encodedAssetType] || null;
};
