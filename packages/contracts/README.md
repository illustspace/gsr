# GeoSpatialRegistry Smart Contracts

## Docs

See the [docs](./docs/README.md) for a full description of the smart contract flows and access control.

## Development

Contracts are stored in `/contracts`.

There are also sample contracts only used in tests stored in `contracts/test`.

### Test

Run tests

```bash
yarn test
```

#### Get gas costs

To show the gas costs in USD of the functions called in tests, use

```bash
yarn test:gas
```

### Build the contract locally

You will have to do this at least once to build the typechain types needed for testing. After that they will be updated automatically when running tests.

```bash
yarn build
```

This will compile the smart contracts, and also generate TypeChain ethers.js classes, which are placed in the `@geospatialregistry/sdk` library for general use.

### Live testing

This will start the local eth network, and deploy the GSR to it.

```bash
yarn blockchain
```

## Verify Contracts

To verify a contract on etherscan/polygon scan, make sure the associated API key is in the .env file, then run `hardhat verify` on the contract, passing in the address and arguments used when deploying:

```bash
yarn hardhat verify --network polygonMumbai "0xceb8bf3f5faef6c50514ff4194c4a338200489df" "GeoSpatialRegistry"
```
