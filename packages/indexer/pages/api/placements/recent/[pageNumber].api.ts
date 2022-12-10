import { PaginatedPlacementQueryResponse } from "@geospatialregistry/sdk";

import { getPaginatedPlacements } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/** Fetch a paginated list of recent placements */
export default wrapServiceEndpoint<PaginatedPlacementQueryResponse>(
  async (req, res) => {
    const pageSize = Math.min(Number(req.query.pageSize || 10), 10);
    const page = Number(req.query.pageNumber);

    const { statusCode, body } = await getPaginatedPlacements(page, pageSize);

    res.status(statusCode).send(body);
  }
);
