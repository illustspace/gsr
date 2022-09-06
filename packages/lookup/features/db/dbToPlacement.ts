import { placementEvent, assetTypes } from "@gsr/sdk";

import { Placement } from "~/features/db";

/** Convert a DB placement to an SDK type */
export const dbToPlacement = (
  placement: Placement
): placementEvent.ValidatedGsrPlacement => {
  return {
    ...placement,
    decodedAssetId: placement.decodedAssetId as assetTypes.DecodedAssetId,
  };
};
