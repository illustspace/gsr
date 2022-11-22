import React, { FunctionComponent, useEffect, useState } from "react";
import { Table, Thead, Tr, Td, Tbody, Text, Link } from "@chakra-ui/react";
import { decode_int } from "ngeohash";
import axios from "axios";
import NextLink from "next/link";
import {
  ApiResponseSuccess,
  deserializeGsrPlacement,
  PlacementQueryResponse,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";
import { CenteredSpinner } from "../utils/CenteredSpinner";
import { FormatAddress } from "../utils/FormatAddress";
import { gsrIndexer } from "../gsr/gsr-indexer";

export const RecentPlacements: FunctionComponent = () => {
  const [recentPlacements, loading] = useRecentPlacements();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (!recentPlacements?.length) {
    return <Text>No Recent placements</Text>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Td>Placed At</Td>
          <Td>Publisher</Td>
          <Td>Location</Td>
          <Td>Asset Type</Td>
          <Td>Asset</Td>
        </Tr>
      </Thead>
      <Tbody>
        {recentPlacements.map((placement) => {
          const coords = decode_int(
            placement.location.geohash,
            placement.location.bitPrecision
          );

          return (
            <Tr key={`${placement.blockHash}-${placement.blockLogIndex}`}>
              <Td>
                {placement.placedAt.toLocaleDateString()}{" "}
                {placement.placedAt.toLocaleTimeString()}
              </Td>
              <Td>
                <FormatAddress address={placement.publisher} />
              </Td>
              <Td>
                {coords.latitude}
                <br />
                {coords.longitude}
              </Td>
              <Td>{placement.decodedAssetId.assetType}</Td>
              <Td>
                <NextLink
                  href={gsrIndexer.explorer.asset(placement.assetId)}
                  passHref
                >
                  <Link>{placement.assetId.slice(0, 6)}...</Link>
                </NextLink>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const useRecentPlacements = (): [
  value: ValidatedGsrPlacement[] | null,
  loading: boolean
] => {
  const [placements, setPlacements] = useState<ValidatedGsrPlacement[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get<ApiResponseSuccess<PlacementQueryResponse>>("/api/placements/recent")
      .then((response) => {
        setPlacements(response.data.data.map(deserializeGsrPlacement));
      })
      .catch(() => {
        setPlacements([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return [placements, isLoading];
};
