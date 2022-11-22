import {
  Box,
  BoxProps,
  FormControl,
  FormHelperText,
  FormLabel,
  Slider,
  Text,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import React, { FunctionComponent, useMemo, useState } from "react";
import Map, {
  FitBoundsOptions,
  Layer,
  LngLatBoundsLike,
  MapLayerMouseEvent,
  Source,
} from "react-map-gl";
import { encode_int, decode_bbox_int } from "ngeohash";

import { ValidatedGsrPlacement } from "@geospatialregistry/sdk";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// import "@shared/styles/variables.scss";
// import "@shared/styles/mapbox-overrides.scss";
import { getEnv } from "~/features/config/env";
import { Optional } from "~/features/utils/optional";
import { AutoGeolocationButton } from "~/features/map/AutoGeolocateButton";

export interface PlacementMapProps extends BoxProps {
  placement?: ValidatedGsrPlacement | null;
  onLocationChange: (location: {
    geohash: number;
    bitPrecision: number;
  }) => void;
}

const mapApi = getEnv("mapboxApiKey");
const mapStyle = getEnv("mapboxStyleUrl");

const fillStyle = {
  id: "bbox-fill",
  type: "fill" as const,
  layout: {},
  paint: {
    "fill-color": "#0080ff", // blue color fill
    "fill-opacity": 0.5,
  },
};

const outlineStyle = {
  id: "bbox-outline",
  type: "line" as const,
  layout: {},
  paint: {
    "line-color": "#000",
    "line-width": 3,
  },
};

const pinStyle = {
  id: "point",
  type: "circle" as const,
  paint: {
    "circle-radius": 10,
    "circle-color": "#007cbf",
  },
};

export const PlacementMap: FunctionComponent<PlacementMapProps> = ({
  placement,
  onLocationChange,
  ...props
}) => {
  const initialBoundingBox = useInitialBbox(placement);
  const initialBoundingBoxCenter = findBboxCenter(initialBoundingBox);

  const [point, setPoint] = useState(initialBoundingBoxCenter);
  const [bitPrecision, setBitPrecision] = useState(
    placement?.location.bitPrecision || 50
  );

  const newGeohash = coordinatesToGeohash(point, bitPrecision);
  const newBbox = newGeohash ? decode_bbox_int(newGeohash, bitPrecision) : null;

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;

    const point = { latitude: lat, longitude: lng };

    setPoint(point);

    const geohash = coordinatesToGeohash(point, bitPrecision);
    onLocationChange({ geohash: geohash || 0, bitPrecision });
  };

  const source = getLayerData(initialBoundingBox);
  const pointSource = getPinData(initialBoundingBox);
  const initialViewState = getInitialViewport(initialBoundingBox);

  const newGeohashSource = getLayerData(newBbox);
  const newPointSource = getPinData(newBbox);

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      {...props}
    >
      <FormLabel>Click to select map location</FormLabel>
      <Box flex={1}>
        <Map
          reuseMaps
          mapStyle={mapStyle}
          mapboxAccessToken={mapApi}
          onClick={handleMapClick}
          initialViewState={initialViewState}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <AutoGeolocationButton />

          {source && (
            <Source id="bbox" type="geojson" data={source}>
              <Layer {...fillStyle} />
              <Layer {...outlineStyle} />
            </Source>
          )}

          {pointSource && (
            <Source id="pin" type="geojson" data={pointSource}>
              <Layer {...pinStyle} />
            </Source>
          )}

          {newGeohashSource && (
            <Source id="newBbox" type="geojson" data={newGeohashSource}>
              <Layer {...fillStyle} id="new-fill-style" />
              <Layer {...outlineStyle} id="new-outline-style" />
            </Source>
          )}

          {newPointSource && (
            <Source id="newPin" type="geojson" data={newPointSource}>
              <Layer {...pinStyle} id="new-pin-style" />
            </Source>
          )}
        </Map>
      </Box>

      {point && (
        <Text>
          {point.latitude}, {point.longitude}
        </Text>
      )}

      <FormControl mt={2}>
        <FormLabel>Precision</FormLabel>

        <Slider
          width="100%"
          aria-label="Precision"
          defaultValue={50}
          min={10}
          max={60}
          orientation="horizontal"
          step={1}
          onChange={setBitPrecision}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>

        <FormHelperText>
          Increase precision for a smaller geofence.
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

const coordinatesToGeohash = (
  coordinates: Optional<{ latitude: number; longitude: number }>,
  bitPrecision: number
) => {
  if (!coordinates) return null;
  return encode_int(coordinates.latitude, coordinates.longitude, bitPrecision);
};

const getPinData = (
  bbox: ngeohash.GeographicBoundingBox | null
): GeoJSON.Feature<GeoJSON.Point> | null => {
  if (!bbox) return null;

  const [minLat, minLon, maxLat, maxLon] = bbox;

  return {
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [
        minLon + (maxLon - minLon) / 2,
        minLat + (maxLat - minLat) / 2,
      ],
    },
    properties: {},
  };
};

const getLayerData = (
  bbox: ngeohash.GeographicBoundingBox | null
): GeoJSON.Feature<GeoJSON.Polygon> | null => {
  if (!bbox) return null;

  const [minLat, minLon, maxLat, maxLon] = bbox;

  return {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [minLon, minLat],
          [minLon, maxLat],
          [maxLon, maxLat],
          [maxLon, minLat],
          [minLon, minLat],
        ],
      ],
    },
    properties: {},
  };
};

const getInitialViewport = (
  bbox: ngeohash.GeographicBoundingBox | null
):
  | {
      bounds?: LngLatBoundsLike | undefined;
      fitBoundsOptions?: FitBoundsOptions | undefined;
    }
  | undefined => {
  if (!bbox) return undefined;

  const [minLat, minLon, maxLat, maxLon] = bbox;

  return {
    bounds: [minLon, minLat, maxLon, maxLat] as [
      number,
      number,
      number,
      number
    ],
    fitBoundsOptions: { padding: 50, maxZoom: 14 },
  };
};

const useInitialBbox = (placement: Optional<ValidatedGsrPlacement>) => {
  return useMemo(() => {
    return placement?.location
      ? decode_bbox_int(
          placement.location.geohash,
          placement.location.bitPrecision
        )
      : null;
  }, [placement]);
};

const findBboxCenter = (bbox: Optional<ngeohash.GeographicBoundingBox>) => {
  if (!bbox) return null;

  const [minLat, minLon, maxLat, maxLon] = bbox;

  return {
    latitude: minLon + (maxLon - minLon) / 2,
    longitude: minLat + (maxLat - minLat) / 2,
  };
};
