import {
  ApiResponseError,
  ApiResponseFail,
  ApiResponseSuccess,
  ApiResponseType,
} from "@geospatialregistry/sdk";
import { NextApiResponse } from "next";

/** @file helpers for generating typed API responses */

export type NextApiResponseType<T> = NextApiResponse<ApiResponseType<T>>;

export function apiSuccess<T>(data: T): ApiResponseSuccess<T> {
  return {
    status: "success",
    data,
  };
}

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

export function apiError(message: string, code: string): ApiResponseError {
  return {
    status: "error",
    message,
    code,
  };
}
