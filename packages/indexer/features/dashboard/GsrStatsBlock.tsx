import { Box, BoxProps, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import React, { FunctionComponent } from "react";

import { GsrStats } from "@geospatialregistry/sdk";

export interface GsrStatsBlockProps {
  stats: GsrStats | null;
}

export const GsrStatsBlock: FunctionComponent<GsrStatsBlockProps> = ({
  stats,
}) => {
  if (!stats) {
    return (
      <Box>
        <Heading as="h2" size="md">
          Something went wrong when fetching GSR stats
        </Heading>
      </Box>
    );
  }
  return (
    <SimpleGrid my={3} minChildWidth="200px">
      <StatCard title="Owned Placements" value={stats.totalOwnedPlacements} />
      <StatCard
        title="Unowned Placements"
        value={stats.totalUnownedPlacements}
      />
      <StatCard title="Total Publishers" value={stats.totalPublishers} />
    </SimpleGrid>
  );
};

interface StatCardProps extends BoxProps {
  title: string;
  value: string | number;
}

const StatCard: FunctionComponent<StatCardProps> = ({
  title,
  value,
  ...props
}) => {
  return (
    <Box p={5} shadow="md" borderWidth="1px" {...props}>
      <Heading fontSize="lg">{title}</Heading>
      <Text mt={4}>{value}</Text>
    </Box>
  );
};
