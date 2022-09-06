// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ApiResponseType, PlacementQueryResponse } from "@gsr/sdk";

import { prisma } from "~/features/db";
import { dbToPlacement } from "~/features/db/dbToPlacement";
import { apiServerFailure, apiSuccess } from "~/features/indexer/api-responses";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<PlacementQueryResponse>>
) {
  const query = {
    assetType: req.query.assetType,
    chainId: req.query.chainId ? Number(req.query.chainId) : undefined,
    contractAddress: req.query.contractAddress,
    tokenId: req.query.tokenId,
  };

  try {
    const placements = await prisma.placement.findMany({
      // Get assets that match the query.
      where: {
        placedByOwner: true,
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
