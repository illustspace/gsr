# Getting Started

## Install

```bash
# NPM
npm i @geospatialregistry/sdk
# Yarn
yarn add @geospatialregistry/sdk
# pnpm
pnpm i @geospatialregistry/sdk
```

## Get an Alchemy API key

The SDK uses free Alchemy nodes to send transactions and perform queries on the
Polygon blockchain.

## Set up instances of gsr and gsrIndexer

The SDK in split into two main classes: [GsrContract] and [GsrIndexer].
GsrContract is for direct access to the smart contract, and is mostly used to do
placements. GsrIndexer wraps the indexer's web API in easy-to-call functions,
and is good for checking which the current location of an asset without knowing
its owner ahead of time.

To set up instances of these classes, and inject your Alchemy keys to talk to
the blockchain, set up instances of them somewhere in your codebase:

```ts filename="gsr.ts"
/** ChainID for the GSR */
const gsrChainId = 137;
// const gsrChainId = 1337; // Mumbai testnet
// const gsrChainId = 80001; // Local devnet

export const gsrIndexer = new GsrIndexer(gsrChainId);

export const gsr = new GsrContract(
  {
    // Pass in an alchemy API key to use to interact with the blockchain.
    alchemy: "your-alchemy-key",
  },
  {
    chainId: gsrChainId,
    indexer: gsrIndexer,
  }
);
```

Then you can access GSR methods elsewhere in your code

```ts
import { gsr, gsrIndexer } from "./gsr";

const placeOfFromContract = await gsr.placeOf(decodedAssetId, signer.address);
const placeOfFromIndexer = await gsrIndexer.placeOf(decodedAssetId);
```

## Chain IDs

You may have noticed that you have to pass the `137` Chain ID when setting up
the `GsrContract` instance. This is
