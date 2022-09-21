import {
  ApiResponseError,
  ApiResponseFail,
  ApiResponseSuccess,
  ApiResponseType,
} from "@geospatialregistry/sdk";
import { NextApiResponse } from "next";

/**
 * @file helpers for Indexer API responses
 */

export type NextApiResponseType<T> = NextApiResponse<ApiResponseType<T>>;

/** Return an API success response */
export function apiSuccess<T>(data: T): ApiResponseSuccess<T> {
  return {
    status: "success",
    data,
  };
}

/** Return an API failure response */
export function apiFailure(
  message: string,
  code: string,
  data: any = null
): ApiResponseFail<any> {
  return {
    status: "fail",
    message,
    code,
    data,
  };
}

/** Return an API error response */
export function apiError(message: string, code: string): ApiResponseError {
  return {
    status: "error",
    message,
    code,
  };
}
