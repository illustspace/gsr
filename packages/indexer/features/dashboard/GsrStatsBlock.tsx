import { Box, SimpleGrid } from "@chakra-ui/react";
import React, { FunctionComponent, useEffect, useState } from "react";

import { GsrStats } from "@gsr/sdk";

import { gsrIndexer } from "../gsr/gsr-indexer";
import { CenteredSpinner } from "../utils/CenteredSpinner";

export const GsrStatsBlock: FunctionComponent = () => {
  const [stats] = useStats();

  if (!stats) return <CenteredSpinner />;

  return (
    <SimpleGrid>
      <Box>{stats.totalPlacements}</Box>
    </SimpleGrid>
  );
};

const useStats = (): [stats: GsrStats | null, isLoaded: boolean] => {
  const [stats, setStats] = useState<GsrStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    gsrIndexer.stats().then((stats) => {
      setIsLoaded(true);
      setStats(stats);
    });
  }, []);

  return [stats, isLoaded];
};
