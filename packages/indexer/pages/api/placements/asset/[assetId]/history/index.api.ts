import { PlacementQueryResponse } from "@geospatialregistry/sdk";

import { getPlacementHistoryByAssetId } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/** Fetch the placement history of an asset. */
export default wrapServiceEndpoint<PlacementQueryResponse>(async (req, res) => {
  const assetId = req.query.assetId as string;
  const includeInvalid = req.query.includeInvalid as string;

  const placedByOwner = includeInvalid !== "true";

  const { statusCode, body } = await getPlacementHistoryByAssetId(
    assetId,
    placedByOwner
  );

  res.status(statusCode).send(body);
});
