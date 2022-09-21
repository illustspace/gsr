# Example Webhook Consumer

An example TypeScript Node.js server that receives webhooks from the GSR Indexer, validates the webhooks, and stores placements in memory.

## Usage

Run the server on port 3002 from the root of the monorepo:

```bash
yarn workspace webhook-consumer start
```

## API

`GET /placements/:assetId`

Returns the most recent placement for the given AssetId

`POST /webhooks/gsr`

Accepts and verifies placement webhooks from the GSR Indexer
