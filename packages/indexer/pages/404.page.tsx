import React from "react";
import type { NextPage } from "next";
import { Heading } from "@chakra-ui/react";

const NotFoundPage: NextPage = () => {
  return (
    <Heading as="h1" mb={3}>
      404 Not Found
    </Heading>
  );
};

export default NotFoundPage;
