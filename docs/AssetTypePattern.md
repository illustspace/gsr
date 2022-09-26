# Adding a New Asset Type

## Updating the GSR sdk to handle a new asset type schema


The GSR is a smart contract designed to take arbitrary hashes and link them to a geohash and time range. However, it is not designed to understand the contents of those hashes. Instead, it is designed to be extensible and accomidate unopinionated data.

In order to make the GSR useful, we need to be able to decode the hashes into useful data. This is done by the GSR SDK, which is a library that can be used to encode and decode placement hashes into useful, check validity of placement hashes, and query the GSR contract for placement data.

## Updating the GSR SDK to handle a new asset type schema

1. Update the `AssetTypePattern` type in `packages/sdk/src/AssetTypePattern.ts` to include the new asset type schema

1. Create a new file in `packages/sdk/src/assetTypes` that exports a function that can decode the new asset type schema

1. Update the `encodeAssetId` function in `packages/sdk/src/encodeAssetId.ts` to encode the new asset type schema

Each of these steps is described in more detail below.

### Updating the `AssetTypePattern` type

The `AssetTypePattern` type is a union of all the possible asset type schemas. It is used to define the type of the `assetType` parameter in the `decodeAssetId` and `encodeAssetId` functions.