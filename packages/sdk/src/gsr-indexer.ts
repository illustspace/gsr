import axios from "axios";

import { GeoJsonFeaturesCollection } from "./geo-json";
import {
  GsrStatsResponse,
  PlacementGeoJsonResponse,
  SinglePlacementResponse,
} from "./api-responses";
import { DecodedAssetId } from "./asset-types";
import { GsrPlacement } from "./placement-event";

export class GsrIndexer {
  private axios;

  constructor(indexerUrl = "https://gsr.illust.space") {
    this.axios = axios.create({
      baseURL: indexerUrl,
    });
  }

  async placeOf(decodedAssetId: DecodedAssetId): Promise<GsrPlacement | null> {
    try {
      const {
        data: { response },
      } = await this.axios.get<SinglePlacementResponse>("/placements/single", {
        params: decodedAssetId,
      });

      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async geoJson(
    query?: Partial<DecodedAssetId>
  ): Promise<GeoJsonFeaturesCollection> {
    const {
      data: { response },
    } = await this.axios.get<PlacementGeoJsonResponse>("/placements/geojson", {
      params: query,
    });

    return response;
  }

  async stats() {
    const {
      data: { response },
    } = await this.axios.get<GsrStatsResponse>("/stats");

    return response;
  }
}
