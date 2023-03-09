# GSR SDK

[![Npm package version](https://badgen.net/npm/v/@geospatialregistry/sdk)](https://npmjs.com/package/@geospatialregistry/sdk)

TypeScript SDK for interacting with the GeoSpatialRegistry

## Install

```bash
yarn install @geospatialregistry/sdk
npm install @geospatialregistry/sdk
```

```ts
import { encodeAssetId, decodeAssetId } from "@geospatialregistry/sdk";
```

### Example Usage

```ts
import {
  GsrContract,
  GsrIndexer,
  geohashBitsToCoordinates,
} from "@geospatialregistry/sdk";
import type { Signer } from "@ethersproject/abstract-signer";

// Connect to the indexer and contract
const gsrIndexer = new GsrIndexer(137);

export const gsr = new GsrContract({
  alchemy: "alchemyApiKey",
  infura: "infuraId",
});

/**
 * Directly query the contract for the location of an asset,
 * if you know the current owner.
 */
async function getPlacementOnChain() {
  const placement = await gsr.placeOf(
    // AssetID for https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/9426
    {
      assetType: "ERC721",
      chainId: 1,
      contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      tokenId: "9426",
    },
    // Publisher
    "0x2eed3b8657a1fc0011EB54e6CAb9B642f25dF7e5"
  );

  // Not placed by this user.
  if (!placement) return null;

  const { latitude, longitude } = geohashBitsToCoordinates(
    Number(placement.geohash),
    placement.bitPrecision
  );
}

/** Get the last valid placement of an asset from the Indexer service. */
async function getPlacementFromIndexer() {
  const placement = await gsrIndexer.placeOf(
    // AssetID for https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/9426
    {
      assetType: "ERC721",
      chainId: 1,
      contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      tokenId: "9426",
    }
  );

  const { latitude, longitude } = geohashBitsToCoordinates(
    placement.location.geohash,
    placement.location.bitPrecision
  );
}

/** Have the signer send a TX to place an asset on the GSR */
function placeAsset(signer: Signer) {
  gsr.place(
    signer,
    {
      assetType: "ERC721",
      chainId: 1,
      contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      tokenId: "9426",
    },
    {
      geohash: 0b10101,
      bitPrecision: 5,
    },
    {
      sceneUri: "https://example.com/scene.json",
    }
  );
}
```

#### Consuming webooks

```ts
// Express route that accepts webhooks about new valid placements.
import express from "express";
import bodyParser from "body-parser";
import {
  GsrContract,
  GsrIndexer,
  geohashBitsToCoordinates,
} from "@geospatialregistry/sdk";

const app = express();
const rawJsonParser = bodyParser.raw({ type: "application/octet-stream" });

export const gsr = new GsrContract({
  alchemy: "alchemyApiKey",
  infura: "infuraId",
});

/** Accepts webhooks from the GSR Indexer */
app.post("/gsr/webhook", rawJsonParser, async (req, res) => {
  const body = req.body.toString();
  const signature = req.headers["gsr-signature"] as string;

  try {
    // Validate and parse the webhook message.
    const newPlacements = gsr.verifyPlacementWebhookMessage(
      body,
      signature,
      "http://localhost:3002/gsr/webhook"
    );

    // Update the placement db.
    newPlacements.forEach((placement) => {
      // Store the placement in your database, with the ID as placement.assetId
    });
  } catch (error) {
    console.error("Invalid webhook", error);
    res.status(400).send("Invalid webhook");
  }

  res.status(201).send("ok");
});
```

## Development

### Test

```bash
yarn ws @geospatialregistry/sdk test
```

Or for test coverage

```bash
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
