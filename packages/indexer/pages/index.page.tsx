import { Container } from "@chakra-ui/react";
import type { NextPage, GetServerSideProps } from "next";
import { GsrStats } from "@geospatialregistry/sdk";

import { AssetSearch } from "~/features/asset-types/AssetSearch";
import { GsrStatsBlock } from "~/features/dashboard/GsrStatsBlock";
import { GsrMap } from "~/features/map/GsrMap";
import { TopNav } from "~/features/nav/TopNav";
import { getStats } from "~/api/stats";

interface HomeProps {
  stats: GsrStats | null;
}
const Home: NextPage<HomeProps> = ({ stats }) => {
  return (
    <Container maxWidth="900px">
      <TopNav />

      <GsrStatsBlock stats={stats} />

      <GsrMap />

      <AssetSearch />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const stats = await getStats().catch(() => null);

  return {
    props: { stats },
  };
};

export default Home;
