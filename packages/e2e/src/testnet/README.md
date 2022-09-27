# e2e Testnet Tests
This directory contains the e2e tests for use with external testnet development and does not run in the github action CI.

The tests use network calls to test specific online or onchain systems which do not have a local simulation version setup.

## Running the tests
To run the testnet tests, run the following command from the root of the repository:

```bash
yarn ws e2e e2e:test:testnet
```

## Testnets

### Tezos 
[jakartanet](https://jakartanet.smartpy.io/)

### Polygon / EVM
[Mumbai](https://chainlist.org/chain/80001)
