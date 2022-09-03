// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma, Placement } from "@gsr/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Placement | string>
) {
  const query = {
    assetType: req.query.assetType,
    chainId: Number(req.query.chainId),
    contractAddress: req.query.contractAddress,
    tokenId: req.query.tokenId,
  };

  try {
    const placement = await prisma.placement.findFirst({
      where: {
        placedByOwner: true,
        decodedAssetId: { equals: query },
      },
      orderBy: {
        placedAt: "desc",
      },
    });

    if (placement) {
      res.status(200).json(placement);
    } else {
      res.status(404).send("no placement");
    }
  } catch (e) {
    const error = e as Error;
    console.error(error);
    res.status(500).send(error.message);
  }
}
