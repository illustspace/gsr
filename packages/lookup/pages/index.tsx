import { Container, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";

import { AssetSearch } from "~/components/AssetSearch";

const Home: NextPage = () => {
  return (
    <Container>
      <Heading>GSR</Heading>

      <AssetSearch />
    </Container>
  );
};

export default Home;
