import { Image, BoxProps, Box, Progress } from "@chakra-ui/react";
import { LngLatBounds } from "mapbox-gl";
import React, { FunctionComponent, useCallback, useState } from "react";
import { getEnv } from "~/features/config/env";

import { InitialViewState } from "./InitialViewState";

export interface LoadingMapProps extends BoxProps {
  viewport: InitialViewState;
}

/** Loads a static map image that fills its container. */
export const LoadingMap: FunctionComponent<LoadingMapProps> = ({
  viewport,
  ...props
}) => {
  const [image, ref] = useImage(viewport);

  return (
    <Box ref={ref} position="relative" {...props}>
      <Image
        alt="loading map"
        height="100%"
        width="100%"
        src={image}
        cursor="not-allowed"
      />

      <Progress
        isIndeterminate
        position="absolute"
        left={0}
        bottom={0}
        right={0}
        colorScheme="orange"
      />
    </Box>
  );
};

/** Load a default image once the outer box is rendered. */
const useImage = ({
  latitude,
  longitude,
  zoom,
  bounds,
  fitBoundsOptions,
}: InitialViewState) => {
  const [image, setImage] = useState("");

  // When the container is rendered, load an image to fit its size.
  const callbackRef = useCallback(
    (container: HTMLDivElement) => {
      if (!container) return;

      const mapboxBaseUrl = mapBoxStyleUrlToHttp(getEnv("mapboxStyleUrl"));
      const mapboxApiKey = getEnv("mapboxApiKey");

      const width = container.clientWidth || 200;
      const height = container.clientHeight || 200;

      const image = bounds
        ? `${mapboxBaseUrl}/static/[${boundsToValues(
            bounds
          )}]/${width}x${height}?access_token=${mapboxApiKey}&attribution=false&padding=${
            fitBoundsOptions?.padding || 100
          }`
        : `${mapboxBaseUrl}/static/${longitude},${latitude},${zoom}/${width}x${height}?access_token=${mapboxApiKey}&attribution=false`;

      setImage(image);
    },
    [latitude, longitude, bounds, fitBoundsOptions, zoom]
  );

  return [image, callbackRef] as const;
};

const boundsToValues = (bounds: LngLatBounds) => {
  let north = bounds.getNorth();
  let south = bounds.getSouth();

  const east = bounds.getEast();
  const west = bounds.getWest();

  let minLng = Math.min(east, west);
  let maxLng = Math.max(east, west);

  // Handle equal bounds
  if (minLng === maxLng) {
    minLng -= 0.01;
    maxLng += 0.01;
  }
  if (north === south) {
    south -= 0.01;
    north += 0.01;
  }

  return [minLng, south, maxLng, north].join(",");
};

const mapBoxStyleUrlToHttp = (mapboxStyleUrl: string) => {
  return mapboxStyleUrl.replace(
    "mapbox://styles",
    "https://api.mapbox.com/styles/v1"
  );
};
