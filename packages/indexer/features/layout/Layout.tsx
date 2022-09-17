import { Box, Container } from "@chakra-ui/react";
import React, { FunctionComponent } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { SEO } from "./SEO";
import { TopNav } from "./TopNav";

export interface LayoutProps {
  title: string;
  description?: string;
  image?: string;
  children: React.ReactNode;
}

/** Layout with navbars for normal pages */
export const Layout: FunctionComponent<LayoutProps> = ({
  title,
  description,
  image,
  children,
}) => {
  return (
    <Box height="100%" className="layout-wrapper">
      <TopNav />

      <Container
        maxW="container.lg"
        w="100%"
        px="4"
        pt={3}
        height="100%"
        className="layout"
        display="flex"
        flexDirection="column"
      >
        <SEO title={title} description={description} image={image} />
        <ErrorBoundary>{children}</ErrorBoundary>
      </Container>
    </Box>
  );
};
