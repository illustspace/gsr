import { GsrSceneMetadata } from "@geospatialregistry/sdk";

/** Base64 encode a message into a sceneUri */
export const sceneToBase64Url = (
  metadata?: GsrSceneMetadata
): string | undefined => {
  if (!metadata) return undefined;

  const stringified = JSON.stringify(metadata);
  const base64 = Buffer.from(stringified).toString("base64");

  return `data:application/json;base64,${base64}`;
};
