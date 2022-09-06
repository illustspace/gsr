import { Placement } from "@gsr/db";
import { placementEvent, assetTypes } from "@gsr/sdk";

/** Convert a DB placement to an SDK type */
export const dbToPlacement = (
  placement: Placement
): placementEvent.ValidatedGsrPlacement => {
  return {
    ...placement,
    decodedAssetId: placement.decodedAssetId as assetTypes.DecodedAssetId,
  };
};
