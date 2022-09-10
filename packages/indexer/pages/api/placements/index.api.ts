// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ApiResponseType, PlacementQueryResponse } from "@gsr/sdk";

import { prisma } from "~/api/db";
import { dbToPlacement } from "~/api/db/dbToPlacement";
import { apiServerFailure, apiSuccess } from "~/api/api-responses";
import { gsr } from "~/features/gsr/gsr-contract";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<PlacementQueryResponse>>
) {
  const query = gsr.parseAssetId(req.query, true);

  try {
    const placements = await prisma.placement.findMany({
      // Get assets that match the query.
      where: {
        placedByOwner: true,
        OR: [
          {
            timeRangeStart: {
              lte: new Date(),
            },
          },
          {
            timeRangeStart: null,
          },
        ],
        decodedAssetId: { equals: query },
      },
      // Only return return the latest placement for the asset.
      distinct: ["assetId"],
      orderBy: {
        placedAt: "desc",
      },
    });

    const validatedPlacements = placements.map(dbToPlacement);

    res.status(200).json(apiSuccess(validatedPlacements));
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}
