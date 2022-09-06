# syntax=docker/dockerfile:1

ARG DATABASE_URL
ARG NEXT_PUBLIC_GSR_CHAIN_ID
ARG NEXT_PUBLIC_ALCHEMY_API_KEY
ARG NEXT_PUBLIC_INFURA_ID

FROM node:lts-slim AS build

WORKDIR /app

# Install yarn2
RUN corepack enable 
RUN corepack prepare yarn@3.2.3 --activate
RUN yarn set version 3.2.3

ENV NODE_ENV=production

# Copy over package.json and install to cache dependencies
COPY "package.json" "./"
COPY "yarn.lock" "./"
COPY ".yarnrc.yml" "./"
COPY ".yarn" "./.yarn"
COPY "packages/contracts/package.json" "./packages/contracts/"
COPY "packages/sdk/package.json" "./packages/sdk/"
COPY "packages/db/package.json" "./packages/db/"
COPY "packages/indexer/package.json" "./packages/indexer/"
RUN yarn install

# pull in env vars
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG NEXT_PUBLIC_GSR_CHAIN_ID
ENV NEXT_PUBLIC_GSR_CHAIN_ID=$NEXT_PUBLIC_GSR_CHAIN_ID

ARG NEXT_PUBLIC_ALCHEMY_API_KEY
ENV NEXT_PUBLIC_ALCHEMY_API_KEY=$NEXT_PUBLIC_ALCHEMY_API_KEY

ARG NEXT_PUBLIC_INFURA_ID
ENV NEXT_PUBLIC_INFURA_ID=$NEXT_PUBLIC_INFURA_ID

# Build packges

COPY "tsconfig.json" "./"
COPY "bin" "./bin/"
COPY "packages/contracts/" "./packages/contracts/"
RUN yarn ws contracts build

COPY "packages/sdk/" "./packages/sdk/"
RUN yarn ws sdk build

RUN apt update && apt install -y \
  libssl1.1 \
	&& rm -rf /var/lib/apt/lists/*

COPY "packages/db/" "./packages/db/"
RUN yarn ws db build

COPY "packages/indexer/" "./packages/indexer/"
RUN yarn ws indexer tsc

# ====
# Build the final image
# ====

from node:lts-slim

WORKDIR /app

RUN apt update && apt install -y \
  libssl1.1 \
	&& rm -rf /var/lib/apt/lists/*

# pull in env vars
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG NEXT_PUBLIC_GSR_CHAIN_ID
ENV NEXT_PUBLIC_GSR_CHAIN_ID=$NEXT_PUBLIC_GSR_CHAIN_ID

ARG NEXT_PUBLIC_ALCHEMY_API_KEY
ENV NEXT_PUBLIC_ALCHEMY_API_KEY=$NEXT_PUBLIC_ALCHEMY_API_KEY

ARG NEXT_PUBLIC_INFURA_ID
ENV NEXT_PUBLIC_INFURA_ID=$NEXT_PUBLIC_INFURA_ID

COPY --from=build /app/package.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/sdk ./packages/sdk
COPY --from=build /app/packages/db ./packages/db
COPY --from=build /app/packages/indexer ./packages/indexer

# Run the indexer
CMD [ "node", "packages/indexer/build/index.js" ]
