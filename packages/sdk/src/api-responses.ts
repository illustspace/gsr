/**
 * @file types for Indexer API responses
 */

import { GeoJsonFeaturesCollection } from "./geo-json";
import { SerializedGsrPlacement } from "./placement-event";
import { GsrSceneMetadata } from "./scene-metadata";

/** A success response */
export interface ApiResponseSuccess<T> {
  success: true;
  response: T;
}

/** A failure response */
export interface ApiResponseError {
  success: false;
  message: string;
  code: string;
}

/** Add error codes to a response type */
export type ApiResponseType<Success extends ApiResponseSuccess<any>> =
  | Success
  | ApiResponseError;

/** /api/indexer/sync */
export type IndexerSyncResponse = ApiResponseSuccess<{
  blockNumber: number;
  events: number;
}>;

/** /api/placements */
export type PlacementQueryResponse = ApiResponseSuccess<
  SerializedGsrPlacement[]
>;

/** /api/placements/single */
export type SinglePlacementResponse =
  ApiResponseSuccess<SerializedGsrPlacement>;

/** /api/placements/geojson */
export type PlacementGeoJsonResponse =
  ApiResponseSuccess<GeoJsonFeaturesCollection>;

/** /api/self-serve/create */
export type SelfServeCreateResponse = ApiResponseSuccess<{
  assetId: string;
  sceneUri: string;
}>;

/** /api/placements/geojson */
export type SelfServeMetadataResponse = ApiResponseSuccess<GsrSceneMetadata>;

/** Statistics about the GSR */
export interface GsrStats {
  totalOwnedPlacements: number;
  totalUnownedPlacements: number;
  totalPublishers: number;
}

/** /api/stats */
export type GsrStatsResponse = ApiResponseSuccess<GsrStats>;

/** /api/meta-transactions/execute */
export type MetaTransactionExecuteResponse = ApiResponseSuccess<{ tx: string }>;

/** /api/meta-transactions/nonce */
export type MetaTransactionNonceResponse = ApiResponseSuccess<{
  nonce: number;
}>;
