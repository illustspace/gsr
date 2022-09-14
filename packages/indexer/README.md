This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Manual Deployment

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
