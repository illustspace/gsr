import { ButtonGroup, Flex, IconButton, Link } from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import NextLink from "next/link";

import { GsrLogo } from "~/assets/GsrLogo";
import { getEnv } from "../config/env";

export const TopNav: FunctionComponent = () => {
  return (
    <Flex
      className="top-nav"
      justify="space-between"
      align="center"
      paddingX={4}
      paddingY={2}
    >
      <Flex className="top-nav__header" alignItems="center">
        <NextLink href="/" passHref>
          <IconButton as="a" variant="ghost" aria-label="GSR">
            <GsrLogo boxSize="3em" />
          </IconButton>
        </NextLink>

        {getTagFromChain()}
      </Flex>

      <ButtonGroup className="top-nav__actions">
        <Link href="#">Litepaper</Link>
        <Link href="#">Login</Link>
      </ButtonGroup>
    </Flex>
  );
};

/** Add the chain name to the header */
const getTagFromChain = () => {
  const gsrChainId = getEnv("gsrChainId");

  if (gsrChainId === 137) {
    return "";
  } else if (gsrChainId === 1337) {
    return <>&nbsp;(devnet)</>;
  } else if (gsrChainId === 80001) {
    return <>&nbsp;(testnet)</>;
  } else {
    return `GSR (${gsrChainId})`;
  }
};
