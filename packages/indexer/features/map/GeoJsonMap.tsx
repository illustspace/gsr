import {
  Map,
  Popup,
  Layer,
  LayerProps,
  Source as MapSource,
  MapLayerMouseEvent,
  MapboxGeoJSONFeature,
  MapRef,
} from "react-map-gl";

import React, {
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useRef,
  RefObject,
  FunctionComponent,
} from "react";
import { Box, BoxProps, useTheme } from "@chakra-ui/react";
import { GeoJsonFeaturesCollection } from "@gsr/sdk";

import mapPin from "~/assets/map-pin.png";
import { CenteredSpinner } from "~/features/utils/CenteredSpinner";

import { AutoGeolocationButton } from "./AutoGeolocateButton";
import { LoadingMap } from "./LoadingMap";
import { getBoundsViewport } from "./fitBounds";
import { GeocoderControl } from "./GeocoderControl";
import { InitialViewState } from "./InitialViewState";
import { getEnv } from "../config/env";
import { Optional } from "../utils/optional";

interface PopupInfo {
  /** An index from the features collection. */
  id: string;
  latitude: number;
  longitude: number;
}

export interface BaseMapProps extends BoxProps {
  /** Use to tie a map to a useMap call from outside. */
  mapId?: string;
  /** GeoJson features to display on the map. */
  features: GeoJsonFeaturesCollection;
  /** The ID of a feature that should show a popup. */
  popupId?: string | number | null;
  /** Listen to this to update the externally managed popupId */
  onPopup?: (id: string | null) => void;
  /** Renders a popup on click, if provided. Passes the ID of the active popup. */
  renderPopup?: (id: string) => ReactNode;
  /**
   * If true, show the geocoding search box.
   * @default true
   */
  showSearch?: boolean;
  /** If true, hide all UI. Good for collapsed minimaps. */
  hideUI?: boolean;
  /**
   * If true, track the user's active location.
   * Otherwise the geo button just moves the map to their location.
   */
  trackUserLocation?: boolean;
  /**
   * Use the user's current location as the initial viewport, even if tracking is off.
   */
  useInitialUserLocation?: boolean;
  /** If falsy, merge all overlapping icons for better performance. */
  allowIconOverlap?: boolean;
  /** Children rendered inside of the map */
  children?: ReactNode;
}

export const DEFAULT_ZOOM = 12;

const heatmapToPinZoom = 8;

const mapApi = getEnv("mapboxApiKey");
const mapStyle = getEnv("mapboxStyleUrl");

/**
 * A base layer around a Mapbox map. Pass in geojson Features to be displayed as pins.
 * To adjust the viewport, wrap the map in a MapProvider, and call useMap to get a map ref that can adjust the viewport.
 */
export const GeoJsonMap: FunctionComponent<BaseMapProps> = ({
  mapId,
  features,
  renderPopup,
  allowIconOverlap = false,
  popupId,
  showSearch = true,
  onPopup = () => {},
  children,
  ...props
}) => {
  const mapRef = useRef<MapRef>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadedPinImage, setLoadedPinImage] = useState(false);

  const initialViewport = useInitialViewport(features);
  const theme = useTheme();

  useFollowFeatures(features, mapRef);

  // Add the pin image when the map loads.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.loadImage(
      mapPin.src,
      (
        error: Error | undefined,
        image: HTMLImageElement | ImageBitmap | undefined
      ) => {
        if (error) console.error(error);
        if (!map?.hasImage("map-pin") && image) {
          map.addImage("map-pin", image, { sdf: true });
        }

        setLoadedPinImage(true);
      }
    );
  }, [loadingMap]);

  // Get the selected feature.
  const popupInfo = useMemo(() => {
    if (!popupId) return null;

    const feature =
      features.data.features.find((feature) => {
        return feature.properties?.id === popupId;
      }) || null;

    return popupInfoFromFeature(feature);
  }, [popupId, features]);

  // styles to add colored pins
  const layerStyle: LayerProps = {
    id: "data",
    type: "symbol",
    source: "places",
    minzoom: heatmapToPinZoom,
    layout: {
      "icon-ignore-placement": true,
      "icon-image": "map-pin",
      "icon-size": 0.5,
      "icon-offset": [-6, -36],
      "icon-allow-overlap": allowIconOverlap,
    },
    paint: {
      "icon-color": ["get", "color"],
    },
    filter: ["==", "icon", "map-pin"],
  };
  const heatMapStyle: LayerProps = {
    id: "art-heat",
    type: "heatmap",
    source: "places",
    maxzoom: heatmapToPinZoom + 1,
    paint: {
      // Increase the heatmap weight based on frequency and property magnitude
      "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
      // Increase the heatmap color weight weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 1],
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      // Begin color ramp at 0-stop with a 0-transparancy color
      // to create a blur-like effect.
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(33,102,172,0)",
        0.1,
        `${theme.colors.brand.highlight}`,
        0.4,
        `#f493ba`,
        0.9,
        `#f15a26`,
        1,
        `rgb(178,24,43)`,
      ],
      // Adjust the heatmap radius by zoom level
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 20, 90],
      // Transition from heatmap to circle layer by zoom level
      "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
    },
  };
  /** Emit a click event on a pin. */
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const clickTarget = event.originalEvent.target as HTMLElement | null;
    const currentZoom = mapRef.current?.getMap()?.getZoom() || 0; //fall back to zero which allows popups
    if (
      !event.point ||
      clickTarget?.tagName === "a" ||
      currentZoom < heatmapToPinZoom
    ) {
      onPopup(null);
      return;
    }
    const markersLayer = event.target.queryRenderedFeatures(event.point);

    /** Find a marker under the click. */
    const popupId = popupIdFromLayer(markersLayer);

    // If there is a marker, emit it.
    onPopup(popupId);
  };

  return (
    <Box height="100%" position="relative" {...props}>
      {loadingMap && (
        <>
          {/* Once the initial viewport is set, show the loading map image there. */}
          {initialViewport ? (
            <LoadingMap
              viewport={initialViewport}
              position="absolute"
              top={0}
              bottom={0}
              left={0}
              right={0}
              zIndex={2}
            />
          ) : (
            //  Show a spinner until the viewport and map is ready
            <CenteredSpinner />
          )}
        </>
      )}

      {/* Render the map right away to start loading. */}
      {initialViewport && (
        <Map
          id={mapId}
          initialViewState={initialViewport}
          projection="globe"
          onClick={handleMapClick}
          attributionControl={false}
          mapStyle={mapStyle}
          mapboxAccessToken={mapApi}
          ref={mapRef}
          onLoad={() => {
            setLoadingMap(false);
            // reset projection to map to resolve flickering issues with layers
            const map = mapRef.current?.getMap();
            if ((map as any)?.setProjection) {
              (map as any).setProjection("globe");
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            opacity: loadingMap ? 0 : 1,
          }}
          trackResize
          interactiveLayerIds={["data"]}
        >
          {children}

          {/* Render the mayer once the pin is ready to display */}
          {loadedPinImage && features?.data?.features?.length && (
            <MapSource id="data" type="geojson" data={features.data}>
              <Layer {...layerStyle} />
              <Layer {...heatMapStyle} />
            </MapSource>
          )}
          {!loadingMap && <AutoGeolocationButton />}

          {/* Show the geocoder search box */}
          {!loadingMap && showSearch && (
            <GeocoderControl
              mapboxAccessToken={mapApi}
              marker={false}
              position="top-right"
            />
          )}

          {/* Show a popup when set */}
          {renderPopup && popupInfo && (
            <Popup
              latitude={popupInfo.latitude}
              longitude={popupInfo.longitude}
              closeButton
              offset={40}
              closeOnClick={false}
              onClose={() => onPopup(null)}
              anchor="bottom"
            >
              {renderPopup(popupInfo.id)}
            </Popup>
          )}
        </Map>
      )}
    </Box>
  );
};

const popupInfoFromFeature = (
  feature: Optional<GeoJSON.Feature<GeoJSON.Geometry>>
): PopupInfo | null => {
  if (!feature) return null;

  // Only works for points.
  if (feature.geometry.type !== "Point") return null;

  const [longitude, latitude] = feature.geometry.coordinates;

  // pass the pin's index back to the parent to display popup
  return {
    id: (feature.properties?.id as string) || "",
    latitude,
    longitude,
  };
};

/** Return a PopupInfo for the first valid pins in a layer group.  */
const popupIdFromLayer = (
  markersLayer: MapboxGeoJSONFeature[] | null
): string | null => {
  if (!markersLayer || markersLayer.length === 0) {
    return null;
  }

  const [topMarkerLayer] = markersLayer;
  return (topMarkerLayer.properties?.id as string) || null;
};

/** Get an initial viewport (if not specified) from the user's current location. */
const useInitialViewport = (
  features: GeoJsonFeaturesCollection
): InitialViewState | null => {
  return useMemo(() => {
    return getBoundsViewport(features);
  }, [features]);
};

/**
 * Update the viewport when the features change
 * But only when the user is not tracking their own location.
 */
const useFollowFeatures = (
  features: GeoJsonFeaturesCollection,
  mapRef: RefObject<MapRef>
) => {
  // Fly when the features change.
  useEffect(() => {
    const newView = getBoundsViewport(features);

    if (newView?.bounds) {
      mapRef.current?.fitBounds(newView.bounds, newView.fitBoundsOptions || {});
    }
  }, [features, mapRef]);
};
