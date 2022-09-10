# gsr-contracts

Monorepo for the GeoSpatialRegistry

This repo contains the GeoSpatialRegistry smart contract, a TypeScript SDK for more easily working with it, and the indexer server for checking ownership of placements.

## Packages

See each packages's README for details on usage and development.

### @geospatialregistry/contracts

The smart contracts hardhat package can be found in [packages/contracts](./packages/contracts/), and the contracts themselves in [packages/contracts/contracts](./packages/contracts/contracts)

See [packages/contracts/docs](./packages/contracts/docs/README.md) for a full walk-through of the smart contract logic.

### @geospatialregistry/sdk

The TypeScript SDK can be found in [packages/sdk](./packages/sdk).

### @geospatialregistry/indexer

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
# Start a local blockchain
yarn ws contracts start
# Start up the test DB, and serve a text indexer on localhost:3001
yarn ws indexer e2e
# Run e2e tests
yarn ws e2e e2e:test
```

For development, you can either start a local blockchain and all services in one command:

```bash
yarn start
```

Or start each one individually

```bash
# local blockchain
yarn ws contracts start
# SDK builder
yarn ws sdk start
# Indexer
yarn ws indexer start
```

## Deployment

Github actions will run tests in CI when a commit goes up to a branch

Commits to develop will deploy to the testnet site

Commits to main will deploy to the mainnet site.
