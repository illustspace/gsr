import axios from "axios";

import { prisma } from "../../indexer/api/db";

// Set the local database URL for prisma
process.env.DATABASE_URL =
  "postgresql://root@localhost:26258/defaultdb?sslmode=disable";

beforeAll(async () => {
  await resetDb();

  // Sync the indexer's nonce with the blockchain
  await axios.post("http://localhost:3001/api/meta-transactions/nonce");
});

const resetDb = async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  await Promise.all(
    tablenames.map(({ tablename }) => {
      if (tablename !== "_prisma_migrations") {
        return prisma
          .$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
          .catch(console.error);
      }

      return null;
    })
  );
};
