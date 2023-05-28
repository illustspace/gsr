# Indexer

A Next.js app that verifies ownership for GSR placements, serves placement
queries, emits webhooks, and has a frontend GSR Explorer.

## Development

### Environment setup

Add some environment variables to the `packages/indexer/.env.local` file, which
is gitignored.

You can
[sign up for Alchemy](https://docs.alchemy.com/docs/alchemy-quickstart-guide#1key-create-an-alchemy-key)
if you want to access Polygon Testnet or Mainnet from your local enviornonment.
Otherwise, leave it out of the `.env.local` file.

```bash
NEXT_PUBLIC_ALCHEMY_API_KEY="<yourAlchemyApiKey>"
NEXT_PUBLIC_INFURA_ID="<yourInfuraApiKey>"
NEXT_PUBLIC_GSR_CHAIN_ID="1337"
NEXT_PUBLIC_MAPBOX_API_KEY="<yourMapboxApiKey>"
NEXT_PUBLIC_MAPBOX_STYLE_URL="<yourMapboxStyleUrl>"
```

### Run dev server

Run the development server and local CockroachDB server:

```bash
yarn start
```

_Note that killing this process will also shut down CockroachDB_

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

### Connect to a remote database

If you want to connect your local indexer to a remote database, simply specify
its `DATABASE_URL` in `.env.local`

```bash
DATABASE_URL="postgresql://<username>:<password>@<database-url>:26257/gsr?sslmode=verify-full"
```

## Webhooks

To register another service that wants updates when a new verified placement is
made, add a Webhook entry to the `Webhooks` table with
`yarn ws indexer db:studio`

Then every time `/sync` is called, if there are any new placements, they will be
sent via `POST` to the registered endpoints. The request will include a
`SerializedGsrPlacement` as `payload`, and `endpoint` it is set to as
`endpoint`. The indexer will also sign the full request body, and place that
signature in the `gsr-signature` header.

To verify the webhook is coming from the expected indexer, you should use the
raw body of the request to verifiy the signature, and verify that signed
endpoint is your service, to prevent replay attacks. See
[examples/webhook-consumer](../../examples/webhook-consumer/src/index.ts) for an
example of how to implement this.

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

## Database

The GSR Indexer uses CockroachDB as its data store. The database connection is
controlled by the `DATABASE_URL` variable in `packages/indexer/.env`

If you want to start the local database in a separate process:

```bash
yarn ws indexer db:start
```

Then you can explore the data with the prisma studio

```bash
yarn ws indexer db:studio
```

To change the database structure, first update the
[schema.prisma](./prisma/schema.prisma) file. Then generate a new migration:

```bash
yarn ws indexer db:migrate my-migration-name
```

If you need to apply existing migrations to the database specified in the
`DATABASE_URL` (like if a merged branch added a new migration), run:

```bash
yarn ws indexer db:deploy
```
