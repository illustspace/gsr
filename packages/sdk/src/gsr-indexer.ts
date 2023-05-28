// eslint-disable-next-line max-classes-per-file
import axios, { AxiosError, AxiosResponse } from "axios";

import {
  ApiResponseSuccess,
  GsrStatsResponse,
  IndexerSyncResponse,
  MetaTransactionExecuteResponse,
  PlacementGeoJsonResponse,
  PlacementQueryResponse,
  SinglePlacementResponse,
} from "./api-responses";
import { DecodedAssetId } from "./asset-types";
import { GeoJsonFeaturesCollection } from "./geo-json";
import { MetaTransaction } from "./metaTransactions";
import {
  deserializeGsrPlacement,
  ValidatedGsrPlacement,
} from "./placement-event";

const indexersByChainId: Record<number, string> = {
  137: "https://indexer.gsr.network/api",
  80001: "https://indexer.testnet.gsr.network/api",
  1337: "http://localhost:3000/api",
};

const indexerAddressByChainId: Record<number, string> = {
  137: "0x71918e7ce6005135d20a50f81c2885822a15abb3",
  80001: "0x71918e7ce6005135d20a50f81c2885822a15abb3",
  1337: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
};

const explorerByChainId: Record<number, string> = {
  137: "https://indexer.gsr.network",
  80001: "https://indexer.testnet.gsr.network",
  1337: "http://localhost:3000",
};

const blockExplorerByChainId: Record<number, string> = {
  137: "https://polygonscan.com",
  80001: "https://mumbai.polygonscan.com",
  1337: "https://example.com",
};

export interface GsrIndexerOpts {
  customIndexerUrl?: string;
  customExplorerUrl?: string;
  customIndexerAddress?: string;
}

export class GsrIndexerError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "GsrIndexerError";

    Object.setPrototypeOf(this, GsrIndexerError.prototype);
  }
}

/** Supports calls to the Indexer APIs, without needing direct smart contract access. */
export class GsrIndexer {
  private axios;
  /** The public address of the indexer service, to be used to sign webhook messages. */
  public address: string;

  private indexerUrl?: string;
  private explorerUrl?: string;

  constructor(public chainId: number, opts: GsrIndexerOpts = {}) {
    this.indexerUrl = opts.customIndexerUrl ?? indexersByChainId[chainId];
    this.explorerUrl = opts.customExplorerUrl ?? explorerByChainId[chainId];
    this.address =
      opts.customIndexerAddress || indexerAddressByChainId[chainId];

    this.axios = axios.create({
      baseURL: this.indexerUrl,
    });
  }

  async placeOf(
    decodedAssetId: DecodedAssetId
  ): Promise<ValidatedGsrPlacement> {
    try {
      const response = await this.axios.get<
        ApiResponseSuccess<SinglePlacementResponse>
      >("/placements/single", {
        params: decodedAssetId,
      });

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

  async placeOfAssetId(assetId: string): Promise<ValidatedGsrPlacement> {
    try {
      const response = await this.axios.get<
        ApiResponseSuccess<SinglePlacementResponse>
      >(`/placements/asset/${assetId}`);

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

  /**
   * Find a Placement by placement ID
   * This can find old or invalid placements
   */
  async placeOfByPlacementId(
    placementId: string
  ): Promise<ValidatedGsrPlacement> {
    try {
      const response = await this.axios.get<
        ApiResponseSuccess<SinglePlacementResponse>
      >(`/placements/id/${placementId}`);

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

  /** Get a placement history for an asset. */
  async getPlacementHistory(assetId: string) {
    const response = await this.axios.get<
      ApiResponseSuccess<PlacementQueryResponse>
    >(`/placements/asset/${assetId}/history`, {});

    const placements = this.getResponse(response);

    return placements.map(deserializeGsrPlacement);
  }

  /** Get a placement history for an asset. */
  async getPlacementHistoryGeoJson(assetId: string) {
    const response = await this.axios.get<PlacementGeoJsonResponse>(
      `/placements/asset/${assetId}/history/geojson`,
      {}
    );

    return response.data;
  }

  /** Search for placements by a partial DecodedAssetId */
  async query(
    query: Partial<DecodedAssetId>
  ): Promise<ValidatedGsrPlacement[]> {
    const response = await this.axios.get<
      ApiResponseSuccess<PlacementQueryResponse>
    >("/placements", {
      params: query,
    });

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

    return response.data;
  }

  async stats() {
    const response = await this.axios.get<ApiResponseSuccess<GsrStatsResponse>>(
      "/stats"
    );

    return this.getResponse(response);
  }

  /** Request a sync from the indexer. Should be done after a placement tx has finished. */
  async sync() {
    const response = await this.axios.post<
      ApiResponseSuccess<IndexerSyncResponse>
    >("/indexer/sync");

    return this.getResponse(response);
  }

  /** Execute a metaTransaction through the GSR Indexer */
  async executeMetaTransaction(
    metaTransaction: MetaTransaction
  ): Promise<string> {
    const response = await this.axios.post<
      ApiResponseSuccess<MetaTransactionExecuteResponse>
    >("/meta-transactions/execute", metaTransaction);

    const { tx } = this.getResponse(response);

    return tx;
  }

  /** Routes to the explorer */
  explorer = {
    home: () => this.explorerUrl,
    asset: (assetId: string) => `${this.explorerUrl}/assets/${assetId}`,
  };

  /** A block explorer URL for the placement transaction. */
  public blockExplorerUrlForPlacement(placement: ValidatedGsrPlacement) {
    const host = blockExplorerByChainId[this.chainId];
    return `${host}/tx/${placement.tx}`;
  }

  /** Fetch the response success payload from the response. */
  private getResponse<T extends ApiResponseSuccess<any>>(
    response: AxiosResponse<T>
  ): T["data"] {
    return response.data.data;
  }
}
