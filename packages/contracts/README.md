# GeoSpatialRegistry Smart Contracts

## Docs

See the [docs](./docs) for a full description of the smart contract flows and access control.

## Development

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
yarn contracts
```

### Live testing

Start the local eth network

```bash
yarn blockchain
```

Deploy the contract locally

```bash
yarn deploy:localhost
```

## Verify Contracts

To verify a contract on etherscan/polygon scan, make sure the associated API key is in the .env file, then run `hardhat verify` on the contract, passing in the address and arguments used when deploying:

```bash
yarn hardhat verify --network polygonMumbai "0xceb8bf3f5faef6c50514ff4194c4a338200489df" "IllustAirdropsV2" "https://api.staging.illust.space/metadata/{id}"
```
