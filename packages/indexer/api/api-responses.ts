import {
  ApiResponseError,
  ApiResponseSuccess,
  ValidationError,
} from "@geospatialregistry/sdk";

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

export function apiServerFailure(error: any): {
  statusCode: number;
  body: ApiResponseError;
} {
  if (error instanceof ValidationError) {
    // TODO: Pass the error fields
    return {
      statusCode: 400,
      body: apiFailure(error.message, "VALIDATION_ERROR"),
    };
  } else {
    console.trace("server error", error);
    return {
      statusCode: 500,
      body: apiFailure(error.message, "INTERNAL_SERVER_ERROR"),
    };
  }
}
