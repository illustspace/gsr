/**
 * @file types for Indexer Service responses
 */

import {
  ApiResponseError,
  ApiResponseFail,
  ApiResponseType,
  ValidationError,
} from "@geospatialregistry/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import {
  apiError,
  apiFailure,
  apiSuccess,
  NextApiResponseType,
} from "./api-responses";

export interface GsrIndexerServiceFail {
  statusCode: number;
  body: ApiResponseFail;
}

export interface GsrIndexerServiceError {
  statusCode: number;
  body: ApiResponseError;
}

export interface GsrIndexerServiceWrapper<T = never> {
  statusCode: number;
  body: ApiResponseType<T>;
}

export function fetchSuccessResponse<T>(
  data: T,
  statusCode = 200
): GsrIndexerServiceWrapper<T> {
  return {
    statusCode,
    body: apiSuccess(data),
  };
}

export function fetchFailResponse(
  message: string,
  code: string,
  statusCode = 400
): GsrIndexerServiceFail {
  return {
    statusCode,
    body: apiFailure(message, code),
  };
}

/** Wrap an endpoint in this function to catch service errors */
export function wrapServiceEndpoint<T>(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse<ApiResponseType<T>>
  ) => void | Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponseType<T>) => {
    try {
      await handler(req, res);
    } catch (e) {
      const { statusCode, body } = fetchCatchResponse(e);
      res.status(statusCode).json(body);
    }
  };
}

/** Turn validation and other service errors into a StatusError or StatusFail */
export function fetchCatchResponse(
  error: any
): GsrIndexerServiceFail | GsrIndexerServiceError {
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
