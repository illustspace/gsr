import { GsrContract } from "@gsr/sdk";

import { prisma } from "./prisma";

const gsr = new GsrContract({});

gsr.watchEvents(async (placement) => {
  if (!(await gsr.verifyPlacement(placement))) {
    return;
  }

  // prisma
  prisma.placement.create({ data: placement });

  // TODO: Call webhooks
});
