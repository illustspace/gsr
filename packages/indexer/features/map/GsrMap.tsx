import React, { FunctionComponent, useEffect, useState } from "react";
import { Box, Table, Tbody } from "@chakra-ui/react";

import {
  GeoJsonFeaturesCollection,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";

import { gsrIndexer } from "../gsr/gsr-indexer";
import { emptyGeoJson } from "./geo-json";
import { GeoJsonMap } from "./GeoJsonMap";
import { AssetView } from "../asset-types/view/AssetView";
import { CenteredSpinner } from "../utils/CenteredSpinner";

export const GsrMap: FunctionComponent = () => {
  const [features] = useGsrMap();

  const [popupId, setPopupId] = useState<string | null>(null);

  return (
    <Box height="300px">
      <GeoJsonMap
        mapId="gsr-map"
        features={features}
        popupId={popupId}
        onPopup={setPopupId}
        renderPopup={(placementId) => {
          return <PlacementPopup placementId={Number(placementId)} />;
        }}
      />
      ;
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

const PlacementPopup: FunctionComponent<{ placementId: number }> = ({
  placementId,
}) => {
  const placement = usePlacement(placementId);

  if (!placement) {
    return <CenteredSpinner />;
  }

  return (
    <Table overflow="auto" style={{ tableLayout: "fixed" }}>
      <Tbody>
        <AssetView decodedAssetId={placement.decodedAssetId} />
      </Tbody>
    </Table>
  );
};

const usePlacement = (placementId: number) => {
  const [placement, setPlacement] = useState<ValidatedGsrPlacement | null>(
    null
  );

  useEffect(() => {
    gsrIndexer
      .placeOfByPlacementId(placementId)
      .then(setPlacement)
      .catch(() => setPlacement(null));
  }, [placementId]);

  return placement;
};
