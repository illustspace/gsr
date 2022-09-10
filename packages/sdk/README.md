# GSR SDK

TypeScript SDK for interacting with the GeoSpatialRegistry

## Install

```bash
yarn install @geospatialregistry/sdk
npm install @geospatialregistry/sdk
```

```ts
import { encodeAssetId, decodeAssetId } from "@geospatialregistry/sdk";
```

## Development

### Test

```test
yarn ws @geospatialregistry/sdk test
```

Or for test coverage

```test
yarn ws @geospatialregistry/sdk test:coverage
```

### Build

```bash
yarn ws @geospatialregistry/sdk build
```

### Format

```bash
yarn ws @geospatialregistry/sdk format
```

### Adding an AssetType

- Add a file named `<AssetType>.ts` to `packages/sdk/src/asset-types`
- Add a class that inherits from `BaseAssetTypeVerifier`
- Decare an `interface <AssetType>AssetId` with a unique `assetType`, and any other data needed to uniquely identify the asset type.
- Declare the `assetType`, and implement the abstract methods for encoding, decoding, and verifying ownership
- in `packages/sdk/src/asset-types/AssetTypeVerifier.ts`:
  - Add the new verifier to `verifierClasses`
  - Add the new AssetType to `type DecodedAssetId`
- Export the verifier and AssetType from `packages/sdk/src/asset-types/index.ts` for individual use
