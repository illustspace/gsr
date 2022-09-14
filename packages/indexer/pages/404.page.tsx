import React from "react";
import type { NextPage } from "next";
import { Center, Container, Heading } from "@chakra-ui/react";

const NotFoundPage: NextPage = () => {
  return (
    <Container>
      <Center>
        <Heading as="h1" mb={3}>
          404 Not Found
        </Heading>
      </Center>
    </Container>
  );
};

export default NotFoundPage;
