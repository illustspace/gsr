import { ApiResponseError, ApiResponseSuccess } from "@geospatialregistry/sdk";

/** @file helpers for generating typed API responses */

export function apiSuccess<T>(response: T): ApiResponseSuccess<T> {
  return {
    success: true,
    response,
  };
}

export function apiFailure(message: string, code: string): ApiResponseError {
  return {
    success: false,
    message,
    code,
  };
}

export function apiServerFailure(error: any) {
  console.trace("server error", error);
  return apiFailure(error.message, "INTERNAL_SERVER_ERROR");
}
