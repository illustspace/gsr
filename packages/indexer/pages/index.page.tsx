import type { NextPage, GetServerSideProps } from "next";
import { GsrStatsResponse } from "@geospatialregistry/sdk";

import { AssetSearch } from "~/features/asset-types/search/AssetSearch";
import { GsrStatsBlock } from "~/features/dashboard/GsrStatsBlock";
import { GsrMap } from "~/features/map/GsrMap";
import { fetchStats } from "~/api/stats";
import { Layout } from "~/features/layout/Layout";
import { fetchCatchResponse } from "~/api/api-fetcher-responses";

interface HomeProps {
  stats: GsrStatsResponse | null;
}
const Home: NextPage<HomeProps> = ({ stats }) => {
  return (
    <Layout title="">
      <GsrStatsBlock stats={stats} />

      <GsrMap />

      <AssetSearch />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { body } = await fetchStats().catch(fetchCatchResponse);

  if (body.status === "success") {
    return {
      props: { stats: body.data },
    };
  } else {
    return {
      props: {
        stats: null,
      },
    };
  }
};

export default Home;
