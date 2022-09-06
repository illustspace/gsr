// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@gsr/db";
import { ApiResponseType, GsrStatsResponse } from "@gsr/sdk";

import { apiServerFailure, apiSuccess } from "~/features/indexer/api-responses";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<GsrStatsResponse>>
) {
  try {
    const statsResponse = await prisma.placement.aggregate({
      _count: {
        placedByOwner: true,
      },
    });

    const stats = {
      totalPlacements: statsResponse._count.placedByOwner,
    };

    res.status(200).json(apiSuccess(stats));
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}
