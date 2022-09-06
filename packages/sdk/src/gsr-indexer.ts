import axios from "axios";

import { GeoJsonFeaturesCollection } from "./geo-json";
import {
  GsrStatsResponse,
  PlacementGeoJsonResponse,
  PlacementQueryResponse,
  SinglePlacementResponse,
} from "./api-responses";
import { DecodedAssetId } from "./asset-types";
import {
  deserializeGsrPlacement,
  ValidatedGsrPlacement,
} from "./placement-event";

export class GsrIndexer {
  private axios;

  constructor(indexerUrl = "https://gsr.illust.space") {
    this.axios = axios.create({
      baseURL: indexerUrl,
    });
  }

  async placeOf(
    decodedAssetId: DecodedAssetId
  ): Promise<ValidatedGsrPlacement | null> {
    try {
      const {
        data: { response },
      } = await this.axios.get<SinglePlacementResponse>("/placements/single", {
        params: decodedAssetId,
      });

      return deserializeGsrPlacement(response);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async query(
    query: Partial<DecodedAssetId>
  ): Promise<ValidatedGsrPlacement[]> {
    const {
      data: { response },
    } = await this.axios.get<PlacementQueryResponse>("/placements", {
      params: query,
    });

    return response.map(deserializeGsrPlacement);
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
