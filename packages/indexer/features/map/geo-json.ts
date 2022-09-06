import { decode } from "ngeohash";

import { GeoJsonFeaturesCollection } from "@gsr/sdk";

import { Placement } from "~/features/db";

export const emptyGeoJson: GeoJsonFeaturesCollection = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
};

export const placementsToGeoJson = (
  placements: Placement[] | null
): GeoJsonFeaturesCollection => {
  if (!placements) {
    return emptyGeoJson;
  }

  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: placements.map((placement) => {
        const point = decode(placement.geohash);
        const coordinates = [point.longitude, point.latitude];
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates,
          },
          properties: {
            id: placement.id,
            assetId: placement.assetId,
          },
        };
      }),
    },
  };
};