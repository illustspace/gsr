# gsr-contracts

Monorepo for the GeoSpatialRegistry

This repo contains the GeoSpatialRegistry smart contract, a TypeScript SDK for more easily working with it, and the indexer server for checking ownership of placements.

## Packages

See each packages's README for details on usage and development.

### @gsr/contracts

The smart contracts hardhat package can be found in [packages/contracts](./packages/contracts/), and the contracts themselves in [packages/contracts/contracts](./packages/contracts/contracts)

See [packages/contracts/docs](./packages/contracts/docs/README.md) for a full walk-through of the smart contract logic.

### @gsr/sdk

The TypeScript SDK can be found in [packages/sdk](./packages/indexer).

### @gsr/indexer

The indexer service can be found in [packages/indexer](./packages/indexer)

## Dev environment setup

First, install and start postgres.

Then install dependencies:

```bash
npm i -g corepack
yarn install
```

Build all packages:

```bash
yarn build
```

Run all unit tests

```bash
yarn test
```

Run E2E tests of the contracts, SDK, and indexer APIs

```bash
yarn ws e2e test:e2e
```

For development, you can either start a local blockchain and all services in one command:

```bash
yarn start
```

Or start each one individually

```bash
yarn ws contracts start
yarn ws sdk start
yarn ws indexer start
```
