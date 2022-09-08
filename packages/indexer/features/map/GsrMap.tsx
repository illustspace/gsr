import React, { FunctionComponent, useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";

import { GeoJsonFeaturesCollection } from "@gsr/sdk";

import { gsrIndexer } from "../gsr/gsr-indexer";
import { emptyGeoJson } from "./geo-json";
import { GeoJsonMap } from "./GeoJsonMap";

export const GsrMap: FunctionComponent = () => {
  const [features] = useGsrMap();

  return (
    <Box height="300px">
      <GeoJsonMap mapId="gsr-map" features={features} />;
    </Box>
  );
};

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
