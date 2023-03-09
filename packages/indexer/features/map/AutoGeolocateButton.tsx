import React, { FunctionComponent } from "react";
import { GeolocateControl } from "react-map-gl";

export interface GeolocationButtonProps {
  zIndex?: number;
}

/** Configure the geolocation button, the option to track on start. */
export const AutoGeolocationButton: FunctionComponent<
  GeolocationButtonProps
> = ({ zIndex = 1 }) => {
  return (
    <GeolocateControl
      positionOptions={{ enableHighAccuracy: false }}
      showAccuracyCircle
      position="top-left"
      style={{ zIndex }}
      fitBoundsOptions={{ duration: 500 }}
    />
  );
};
