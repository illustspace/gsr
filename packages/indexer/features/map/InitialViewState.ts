import { ViewState, LngLatBounds, FitBoundsOptions } from "react-map-gl";

/** The initial view state prop for mapbox. Supports lat/lng or bounds */
export type InitialViewState = Partial<ViewState> & {
  bounds?: LngLatBounds;
  fitBoundsOptions?: FitBoundsOptions;
};
