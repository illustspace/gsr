import React from "react";
import type { NextPage } from "next";
import { Heading, Text } from "@chakra-ui/react";

import { Layout } from "~/features/layout/Layout";
import { AssetSearch } from "~/features/asset-types/search/AssetSearch";

const PlacePage: NextPage = () => {
  return (
    <Layout title="Place">
      <Heading as="h1" mb={3}>
        Place
      </Heading>

      <Text>Find and place digital assets in the world</Text>

      <AssetSearch />
    </Layout>
  );
};

export default PlacePage;
