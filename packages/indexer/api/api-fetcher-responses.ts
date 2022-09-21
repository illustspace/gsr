import {
  ApiResponseError,
  ApiResponseFail,
  ApiResponseType,
  ValidationError,
} from "@geospatialregistry/sdk";
import { apiError, apiFailure, apiSuccess } from "./api-responses";

export interface FetchStatusFail {
  statusCode: number;
  body: ApiResponseFail;
}

export interface FetchStatusError {
  statusCode: number;
  body: ApiResponseError;
}

export interface FetchStatusWrapper<T = never> {
  statusCode: number;
  body: ApiResponseType<T>;
}

export function fetchSuccessResponse<T>(
  data: T,
  statusCode = 200
): FetchStatusWrapper<T> {
  return {
    statusCode,
    body: apiSuccess(data),
  };
}

export function fetchFailResponse(
  message: string,
  code: string,
  statusCode = 400
): FetchStatusFail {
  return {
    statusCode,
    body: apiFailure(message, code),
  };
}

export function fetchCatchResponse(
  error: any
): FetchStatusFail | FetchStatusError {
  if (error instanceof ValidationError) {
    // TODO: Pass the error fields
    return {
      statusCode: 400,
      body: apiError(error.message, "VALIDATION_ERROR"),
    };
  } else {
    console.trace("server error", error);
    return {
      statusCode: 500,
      body: apiError(error.message, "INTERNAL_SERVER_ERROR"),
    };
  }
}
