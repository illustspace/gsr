# syntax=docker/dockerfile:1

FROM node:18
ENV NODE_ENV=production
WORKDIR /app

# Copy over package.json and install to cache dependencies
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --immutable

# Copy over source code
COPY . .

RUN yarn build

# Run the indexer
CMD [ "yarn", "ws", "indexer", "serve" ]
