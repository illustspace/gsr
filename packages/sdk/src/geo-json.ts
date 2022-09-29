import { FeatureCollection, Point } from "geojson";

export interface GeoJsonFeaturesCollection {
  type: "geojson";
  data: FeatureCollection<
    Point,
    {
      id: string;
      assetId: string;
    }
  >;
}
