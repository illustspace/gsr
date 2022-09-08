/**
 * Scene metadata
 * Based on https://docs.opensea.io/docs/metadata-standards
 */
export interface GsrSceneMetadata {
  /** Name of the placement */
  name?: string;
  /** A poster image */
  image?: string;
  /** Long description */
  description?: string;
  /** A model/video/audio URL */
  animation_url?: string;
  /** A background color when displaying the asset */
  background_color?: string;
  /** A URL to learn more about the placement */
  external_url?: string;
  /** A youtube URL about the placement */
  youtube_url?: string;
  /** Traits */
  attributes?: Record<string, any>[];
  // Scenes can include other arbitrary application-specific data
  [key: string]: string | number | any;

  /** Scene contents. */
  content?: {
    /** A multi-line message string to display */
    message?: string;
  };
}
