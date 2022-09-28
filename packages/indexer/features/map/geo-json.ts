import { decode_int } from "ngeohash";

import { GeoJsonFeaturesCollection } from "@geospatialregistry/sdk";

import { Placement } from "~/api/db";

export const emptyGeoJson: GeoJsonFeaturesCollection = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
};

/** Convert a list of placements to a GeoJSON FeaturesCollections */
export const placementsToGeoJson = (
  placements:
    | Pick<
        Placement,
        | "blockHash"
        | "blockLogIndex"
        | "assetId"
        | "geohashBits"
        | "geohashBitPrecision"
      >[]
    | null
): GeoJsonFeaturesCollection => {
  if (!placements) {
    return emptyGeoJson;
  }

  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: placements.map((placement) => {
        const point = decode_int(
          Number(placement.geohashBits),
          placement.geohashBitPrecision
        );
        const coordinates = [point.longitude, point.latitude];
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates,
          },
          properties: {
            id: placementToId(placement),
            assetId: placement.assetId,
          },
        };
      }),
    },
  };
};

/** Extract a unique ID from a placement. */
const placementToId = (placement: {
  blockHash: string;
  blockLogIndex: number;
}) => {
  return `${placement.blockHash}_${placement.blockLogIndex}`;
};
