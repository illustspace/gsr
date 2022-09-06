import { LngLatBounds } from "mapbox-gl";
import { GeoJsonFeaturesCollection } from "@gsr/sdk";

import { InitialViewState } from "./InitialViewState";

export const createBounds = (
  features: GeoJsonFeaturesCollection
): LngLatBounds | null => {
  if (features.data.features.length === 0) return null;

  const bounds = new LngLatBounds();

  features.data.features.forEach((feature) => {
    if (feature.geometry.type !== "Point") return;

    bounds.extend(feature.geometry.coordinates as [number, number]);
  });

  return bounds;
};

/** Get a bounded viewport from a features collection. */
export const getBoundsViewport = (
  features: GeoJsonFeaturesCollection
): InitialViewState | null => {
  const bounds = createBounds(features);

  return bounds
    ? { bounds, fitBoundsOptions: { padding: 100, maxZoom: 14 } }
    : null;
};
