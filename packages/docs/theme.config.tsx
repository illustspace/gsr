import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";
import { GsrLogo } from "./components/GsrLogo";

const config: DocsThemeConfig = {
  logo: <GsrLogo />,
  project: {
    link: "https://github.com/illustspace/gsr",
  },
  chat: {
    link: "https://discord.gg/P46djEbH8E",
  },
  docsRepositoryBase:
    "https://github.com/illustspace/gsr/blob/main/packages/docs/pages",
  footer: {
    text: "GeoSpatialRegistry",
  },
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/") {
      return {
        titleTemplate: "%s | GSR Docs",
      };
    }
    return {
      titleTemplate: "GSR Docs",
    };
  },
};

export default config;
