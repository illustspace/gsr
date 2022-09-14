import { PrismaClient, Placement, ServiceState } from "@prisma/client";

export const prisma = new PrismaClient();

export type { Placement, ServiceState };
