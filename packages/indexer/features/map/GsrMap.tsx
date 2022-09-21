import React, { FunctionComponent, useEffect, useState } from "react";
import { Box, Table, Tbody } from "@chakra-ui/react";

import {
  GeoJsonFeaturesCollection,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";

import { gsrIndexer } from "../gsr/gsr-indexer";
import { GeoJsonMap } from "./GeoJsonMap";
import { AssetView } from "../asset-types/view/AssetView";
import { CenteredSpinner } from "../utils/CenteredSpinner";

export interface GsrMapProps {
  features: GeoJsonFeaturesCollection;
}

/** Show a map of GSR placements */
export const GsrMap: FunctionComponent<GsrMapProps> = ({ features }) => {
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
