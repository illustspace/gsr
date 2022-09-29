# Indexer

A Next.js app that verifies ownership for GSR placements, serves placement queries, emits webhooks, and has a frontend GSR Explorer.

## Development

First, run the development server and dockerized Postgres database

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Webhooks

To register another service that wants updates when a new verified placement is made, add a Webhook entry to the `Webhooks` table with `yarn ws indexer db:studio`

Then every time `/sync` is called, if there are any new placements, they will be sent via `POST` to the registered endpoints. The request will include a `SerializedGsrPlacement` as `payload`, and `endpoint` it is set to as `endpoint`. The indexer will also sign the full request body, and place that signature in the `gsr-signature` header.

To verify the webhook is coming from the expected indexer, you should use the raw body of the request to verifiy the signature, and verify that signed endpoint is your service, to prevent replay attacks. See [examples/webhook-consumer](../../examples/webhook-consumer/src/index.ts) for an example of how to implement this.

## Deployment

The Indexer frontend and API is deployed on Vercel by Github Actions.

To manually deploy, run the following commands in the root directory:

```bash
# Pull ENV vars from Vercel
yarn vercel pull --environment=<preview|production>
# Build the packages with the Vercel env vars
yarn vercel build
# Deploy to Preview Environment
yarn vercel deploy --prebuilt
# OR Deploy to prod
yarn vercel deploy --prebuilt --prod
```
