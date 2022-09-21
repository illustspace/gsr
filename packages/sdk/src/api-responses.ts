/**
 * @file types for Indexer API responses
 * Response types based on https://github.com/omniti-labs/jsend
 */

import { GeoJsonFeaturesCollection } from "./geo-json";
import { SerializedGsrPlacement } from "./placement-event";

/** A success response */
export interface ApiResponseSuccess<T> {
  status: "success";
  data: T;
}

/** A failure response */
export interface ApiResponseFail<T = undefined> {
  status: "fail";
  message: string;
  code: string;
  data: T;
}

export interface ApiResponseError {
  status: "error";
  message: string;
  code: string;
}

/** Add error codes to a response type */
export type ApiResponseType<Success, Failure = undefined> =
  | ApiResponseSuccess<Success>
  | ApiResponseFail<Failure>
  | ApiResponseError;

/** /api/indexer/sync */
export interface IndexerSyncResponse {
  blockNumber: number;
  events: number;
}

/** /api/placements */
export type PlacementQueryResponse = SerializedGsrPlacement[];

/** /api/placements/single */
export type SinglePlacementResponse = SerializedGsrPlacement;

/** /api/placements/geojson */
export type PlacementGeoJsonResponse = GeoJsonFeaturesCollection;

/** /api/stats */
export interface GsrStatsResponse {
  totalOwnedPlacements: number;
  totalUnownedPlacements: number;
  totalPublishers: number;
}

/** /api/meta-transactions/execute */
export interface MetaTransactionExecuteResponse {
  tx: string;
}

/** /api/meta-transactions/nonce */
export interface MetaTransactionNonceResponse {
  nonce: number;
}
