import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  Table,
  Thead,
  Tr,
  Td,
  Tbody,
  Text,
  Link,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { decode_int } from "ngeohash";
import axios from "axios";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ParsedUrlQueryInput } from "querystring";
import { UrlObject } from "url";
import {
  ApiResponseSuccess,
  deserializeGsrPlacement,
  PaginatedPlacementQueryResponse,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";

import { CenteredSpinner } from "../utils/CenteredSpinner";
import { FormatAddress } from "../utils/FormatAddress";
import { gsrIndexer } from "../gsr/gsr-indexer";

interface PaginatedPlacements {
  placements: ValidatedGsrPlacement[];
  total: number;
}

const PAGE_SIZE = 10;

export const RecentPlacements: FunctionComponent = () => {
  const { pageNumber, getPageLink } = usePageQuery();
  const [recentPlacements, loading] = useRecentPlacements(pageNumber);

  if (loading || !recentPlacements) {
    return <CenteredSpinner />;
  }

  if (!recentPlacements.total) {
    return <Text>No Recent placements</Text>;
  }

  const maxPageNumber = Math.floor(recentPlacements.total / PAGE_SIZE);

  return (
    <>
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
          {recentPlacements.placements.map((placement) => {
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

      <ButtonGroup justifyContent="center" mt={3}>
        <PageButton
          page={0}
          min={0}
          currentPage={pageNumber}
          getPageLink={getPageLink}
        />

        <PageButton
          page={pageNumber - 1}
          min={1}
          currentPage={pageNumber}
          getPageLink={getPageLink}
        />

        <Button colorScheme="blackAlpha">
          {Math.ceil(pageNumber / PAGE_SIZE) + 1}
        </Button>

        <PageButton
          page={pageNumber + 1}
          max={maxPageNumber - 1}
          currentPage={pageNumber}
          getPageLink={getPageLink}
        />

        <PageButton
          page={maxPageNumber}
          max={maxPageNumber}
          currentPage={pageNumber}
          getPageLink={getPageLink}
        />
      </ButtonGroup>
    </>
  );
};

const useRecentPlacements = (
  pageNumber: number
): [value: PaginatedPlacements | null, loading: boolean] => {
  const [placements, setPlacements] = useState<PaginatedPlacements | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get<ApiResponseSuccess<PaginatedPlacementQueryResponse>>(
        `/api/placements/recent/${pageNumber}`,
        {
          params: { pageSize: PAGE_SIZE },
        }
      )
      .then((response) => {
        const { placements, total } = response.data.data;

        setPlacements({
          placements: placements.map(deserializeGsrPlacement),
          total,
        });
      })
      .catch(() => {
        setPlacements({ placements: [], total: 0 });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [pageNumber]);

  return [placements, isLoading];
};

const usePageQuery = () => {
  const { query, asPath } = useRouter();

  const getPageLink = (page: number): UrlObject => {
    if (typeof window === "undefined") return { query };

    const { pathname } = new URL(asPath, window.location.origin);

    return {
      pathname,
      query: {
        page,
      },
    };
  };

  return { pageNumber: Number(query.page || 0), getPageLink };
};

export const useQueryParamsHref = (
  query: string | ParsedUrlQueryInput | null
): UrlObject => {
  const { asPath } = useRouter();
  return useMemo(() => {
    const { pathname } = new URL(asPath, "");

    return {
      pathname,
      query,
    };
  }, [asPath, query]);
};

interface PageButtonProps {
  currentPage: number;
  page: number;
  min?: number;
  max?: number;
  getPageLink: (page: number) => UrlObject;
}

const PageButton: FunctionComponent<PageButtonProps> = ({
  currentPage,
  page,
  min = null,
  max = null,
  getPageLink,
}) => {
  if (min !== null && currentPage <= min) return null;
  if (max !== null && currentPage >= max) return null;

  return (
    <NextLink href={getPageLink(page)} shallow passHref>
      <Button as="a">{page + 1}</Button>
    </NextLink>
  );
};
