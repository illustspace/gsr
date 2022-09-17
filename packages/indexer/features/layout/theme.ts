import { extendTheme, ThemeOverride } from "@chakra-ui/react";

/** Chakra theme */
const config: ThemeOverride = {
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Roboto",
    body: "Roboto",
    mono: "monospace",
  },
};

export const theme = extendTheme(config);
