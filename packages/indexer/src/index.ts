import express from "express";

import { startIndexer } from "./indexer";
import { prisma } from "./prisma";

const app = express();
const port = 3000;

app.get("/placement", async (req, res) => {
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
      res.status(200).send(placement);
    } else {
      res.status(404).send("no placement");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}`);
});

startIndexer();
