import { GsrContract } from "@gsr/sdk";

import { getEnv } from "../config/env";
import { gsrIndexer } from "./gsr-indexer";

export const gsr = new GsrContract(
  {
    alchemy: getEnv("alchemyApiKey"),
    infura: getEnv("infuraId"),
  },
  {
    chainId: getEnv("gsrChainId"),
    indexer: gsrIndexer,
  }
);
