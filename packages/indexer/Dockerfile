# syntax=docker/dockerfile:1

FROM node:18

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

# Copy over source code

COPY "tsconfig.json" "./"
COPY "bin" "./bin/"
COPY "packages/contracts/" "./packages/contracts/"
RUN yarn ws contracts build

COPY "packages/sdk/" "./packages/sdk/"
RUN yarn ws sdk build

COPY "packages/db/" "./packages/db/"
RUN yarn ws db build

COPY "packages/indexer/" "./packages/indexer/"
RUN yarn ws indexer build

# Run the indexer
CMD [ "yarn", "ws", "indexer", "serve" ]
