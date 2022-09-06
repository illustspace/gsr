import { Box, Flex, Heading } from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import { getEnv } from "../config/env";

export const TopNav: FunctionComponent = () => {
  return (
    <Flex className="top-nav" justify="space-between" align="center">
      <Box className="top-nav__header">
        <Heading as="h1" size="md">
          {getNameFromChain()}
        </Heading>
      </Box>
    </Flex>
  );
};

/** Add the chain name to the header */
const getNameFromChain = () => {
  const gsrChainId = getEnv("gsrChainId");

  if (gsrChainId === 137) {
    return "GSR";
  } else if (gsrChainId === 1337) {
    return "GSR (devnet)";
  } else if (gsrChainId === 80001) {
    return "GSR (testnet)";
  } else {
    return `GSR (${gsrChainId})`;
  }
};
