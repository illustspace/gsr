import { Container } from "@chakra-ui/react";
import type { NextPage } from "next";

import { AssetSearch } from "~/components/AssetSearch";
import { GsrStatsBlock } from "~/features/dashboard/GsrStatsBlock";
import { GsrMap } from "~/features/map/GsrMap";
import { TopNav } from "~/features/nav/TopNav";

const Home: NextPage = () => {
  return (
    <Container>
      <TopNav />

      <GsrStatsBlock />

      <GsrMap />

      <AssetSearch />
    </Container>
  );
};

export default Home;
