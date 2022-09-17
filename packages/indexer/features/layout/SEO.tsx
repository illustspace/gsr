import React, { FunctionComponent } from "react";
import Head from "next/head";

export interface SEOProps {
  title?: string;
  image?: string;
  description?: string;
}

export const SEO: FunctionComponent<SEOProps> = ({
  title,
  image,
  description,
}) => {
  const finalTitle = title ? `GSR | ${title}` : "GSR";
  const finalDescription = description || "GeoSpatial Registry";

  return (
    <Head>
      <title>{finalTitle}</title>
      <meta property="og:title" content={finalTitle} />
      {image && <meta property="og:image" content={image} />}

      <link rel="icon" href="/favicon.ico" />
      <meta name="description" content={finalDescription} />

      <meta property="og:type" content="website" />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:site_name" content="Illust" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@illustspace" />
    </Head>
  );
};
