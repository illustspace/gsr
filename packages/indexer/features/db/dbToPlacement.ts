import {
  serializeGsrPlacement,
  SerializedGsrPlacement,
  DecodedAssetId,
} from "@gsr/sdk";

import { Placement } from "~/features/db";

/** Convert a DB placement to an SDK type */
export const dbToPlacement = (placement: Placement): SerializedGsrPlacement => {
  return serializeGsrPlacement({
    ...placement,
    decodedAssetId: placement.decodedAssetId as DecodedAssetId,
  });
};
