import { PrismaClient } from "@prisma/client";
import { GsrContract } from "@gsr/sdk";

const prisma = new PrismaClient();

const gsr = new GsrContract({});

gsr.watchEvents(async (placement) => {
  if (!(await gsr.verifyPlacement(placement))) {
    return;
  }

  // prisma
  prisma.placement.create({ data: placement });
});
