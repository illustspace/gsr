import type { NextPage, GetServerSideProps } from "next";
import {
  GeoJsonFeaturesCollection,
  GsrStatsResponse,
} from "@geospatialregistry/sdk";
import { useState, useEffect } from "react";

import { AssetSearch } from "~/features/asset-types/search/AssetSearch";
import { GsrStatsBlock } from "~/features/dashboard/GsrStatsBlock";
import { GsrMap } from "~/features/map/GsrMap";
import { fetchStats } from "~/api/services/stats.service";
import { Layout } from "~/features/layout/Layout";
import { gsrIndexer } from "~/features/gsr/gsr-indexer";
import { emptyGeoJson } from "~/features/map/geo-json";

import { fetchCatchResponse } from "../api/services/responses/service-response";

interface HomeProps {
  stats: GsrStatsResponse | null;
}
const Home: NextPage<HomeProps> = ({ stats }) => {
  const [features] = useGsrMap();

  return (
    <Layout title="">
      <GsrStatsBlock stats={stats} />

      <GsrMap features={features} />

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

const useGsrMap = (): [
  geojson: GeoJsonFeaturesCollection,
  isLoaded: boolean
] => {
  const [geojson, setFeatures] =
    useState<GeoJsonFeaturesCollection>(emptyGeoJson);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    gsrIndexer.geoJson().then((features) => {
      setIsLoaded(true);
      setFeatures(features);
    });
  }, []);

  return [geojson, isLoaded];
};
