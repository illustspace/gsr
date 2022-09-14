// eslint-disable-next-line max-classes-per-file
import axios, { AxiosError, AxiosResponse } from "axios";

import { GeoJsonFeaturesCollection } from "./geo-json";
import {
  ApiResponseSuccess,
  GsrStatsResponse,
  IndexerSyncResponse,
  PlacementGeoJsonResponse,
  PlacementQueryResponse,
  SinglePlacementResponse,
} from "./api-responses";
import { DecodedAssetId } from "./asset-types";
import {
  deserializeGsrPlacement,
  ValidatedGsrPlacement,
} from "./placement-event";

const indexersByChainId: Record<number, string> = {
  137: "https://gsr.network/api",
  80001: "https://testnet.gsr.network/api",
  1337: "http://localhost:3000/api",
};

export interface GsrIndexerOpts {
  customIndexerUrl?: string;
}

export class GsrIndexerError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "GsrIndexerError";
  }
}

/** Supports calls to the Indexer APIs, without needing direct smart contract access. */
export class GsrIndexer {
  private axios;

  constructor(
    public chainId: number,
    { customIndexerUrl }: GsrIndexerOpts = {}
  ) {
    const indexerUrl = customIndexerUrl || indexersByChainId[chainId];
    this.axios = axios.create({
      baseURL: indexerUrl,
    });
  }

  async placeOf(
    decodedAssetId: DecodedAssetId
  ): Promise<ValidatedGsrPlacement> {
    try {
      const response = await this.axios.get<SinglePlacementResponse>(
        "/placements/single",
        {
          params: decodedAssetId,
        }
      );

      const placement = this.getResponse(response);

      return deserializeGsrPlacement(placement);
    } catch (e) {
      const error = e as AxiosError;

      const data = error.response?.data || ({} as any);

      throw new GsrIndexerError(
        data.message || "Something went wrong",
        data.code || "UNKNOWN_ERROR"
      );
    }
  }

  async query(
    query: Partial<DecodedAssetId>
  ): Promise<ValidatedGsrPlacement[]> {
    const response = await this.axios.get<PlacementQueryResponse>(
      "/placements",
      {
        params: query,
      }
    );

    const placements = this.getResponse(response);

    return placements.map(deserializeGsrPlacement);
  }

  async geoJson(
    query?: Partial<DecodedAssetId>
  ): Promise<GeoJsonFeaturesCollection> {
    const response = await this.axios.get<PlacementGeoJsonResponse>(
      "/placements/geojson",
      {
        params: query,
      }
    );

    return this.getResponse(response);
  }

  async stats() {
    const response = await this.axios.get<GsrStatsResponse>("/stats");

    return this.getResponse(response);
  }

  /** Request a sync from the indexer. Should be done after a placement tx has finished. */
  async sync() {
    const response = await this.axios.post<IndexerSyncResponse>(
      "/indexer/sync"
    );
    return this.getResponse(response);
  }

  /** Fetch the response success payload from the response. */
  private getResponse<T extends ApiResponseSuccess<any>>(
    response: AxiosResponse<T>
  ): T["response"] {
    return response.data.response;
  }
}
