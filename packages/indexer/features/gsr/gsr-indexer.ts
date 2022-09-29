import { GsrIndexer } from "@geospatialregistry/sdk";
import { getEnv } from "../config/env";

export const gsrIndexer = new GsrIndexer(getEnv("gsrChainId"), {
  customIndexerUrl: "/api",
  customExplorerUrl: "",
});
