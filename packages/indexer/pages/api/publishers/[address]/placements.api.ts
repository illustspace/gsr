import { PaginatedPlacementQueryResponse } from "@geospatialregistry/sdk";

import { fetchPlacedAssetsByPublisher } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/** Fetch a list of assets placed by a publisher*/
export default wrapServiceEndpoint<PaginatedPlacementQueryResponse>(
  async (req, res) => {
    const publisher = (req.query.publisher as string).toLowerCase();
    const pageSize = Math.min(Number(req.query.pageSize || 10), 10);
    const page = Number(req.query.pageNumber);

    const { statusCode, body } = await fetchPlacedAssetsByPublisher(
      publisher,
      page,
      pageSize
    );

    res.status(statusCode).send(body);
  }
);
