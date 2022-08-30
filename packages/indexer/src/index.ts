import express from "express";
import "./indexer";

import { prisma } from "./prisma";

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const placement = await prisma.placement.findFirst({
    where: req.body,
    orderBy: {
      placedAt: "desc",
    },
  });

  if (placement) {
    res.status(200).send(placement);
  } else {
    res.status(404).send(placement);
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}`);
});
