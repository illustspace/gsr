import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import {
  Box,
  Heading,
  Link,
  Table,
  Tbody,
  Td,
  Tr,
  Text,
  Thead,
} from "@chakra-ui/react";
import { decode_int } from "ngeohash";
import NextLink from "next/link";
import {
  deserializeGsrPlacement,
  GeoJsonFeaturesCollection,
  SerializedGsrPlacement,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";

import { Layout } from "~/features/layout/Layout";
import { getPlacementByAssetId } from "~/api/fetchPlacements";
import { fetchCatchResponse } from "~/api/responses/api-fetcher-responses";
import { AssetView } from "~/features/asset-types/view/AssetView";
import { gsrIndexer } from "~/features/gsr/gsr-indexer";
import { CenteredSpinner } from "~/features/utils/CenteredSpinner";
import { GsrMap } from "~/features/map/GsrMap";

interface AssetIdPageProps {
  serializedPlacement: SerializedGsrPlacement | null;
  message?: string;
}

const AssetIdPage: NextPage<AssetIdPageProps> = ({ serializedPlacement }) => {
  const history = usePlacementHistory(serializedPlacement?.assetId);
  const historyFeatures = useHistoryMap(serializedPlacement?.assetId);

  if (!serializedPlacement) {
    return (
      <Layout title="Asset Not Found">
        <Heading as="h1" mb={3}>
          Asset Not Found
        </Heading>
      </Layout>
    );
  }

  const placement = deserializeGsrPlacement(serializedPlacement);

  const coords = decode_int(
    placement.location.geohash,
    placement.location.bitPrecision
  );

  const activeSince = new Date(
    Math.max(
      placement.timeRange.start?.getTime() || 0,
      placement.placedAt.getTime()
    )
  );

  return (
    <Layout title={`Placement ${placement.assetId}`}>
      <Heading as="h1" mb={3}>
        Asset
      </Heading>

      <Table>
        <Tbody>
          <AssetView decodedAssetId={placement.decodedAssetId} />
          <Tr>
            <Td>Asset ID</Td>
            <Td>{placement.assetId}</Td>
          </Tr>

          <Tr>
            <Td>Placed Within</Td>
            <Td>
              {placement.parentAssetId ? (
                <NextLink
                  href={gsrIndexer.explorer.asset(placement.parentAssetId)}
                  passHref
                >
                  <Link>{placement.parentAssetId}</Link>
                </NextLink>
              ) : (
                "None"
              )}
            </Td>
          </Tr>

          <Tr>
            <Td>Latitude</Td>
            <Td>{coords.latitude}</Td>
          </Tr>

          <Tr>
            <Td>Longitude</Td>
            <Td>{coords.longitude}</Td>
          </Tr>

          <Tr>
            <Td>Active Since</Td>
            <Td>
              {activeSince.toLocaleDateString()}{" "}
              {activeSince.toLocaleTimeString()}
            </Td>
          </Tr>

          <Tr>
            <Td>End Time</Td>
            <Td>{placement.timeRange.end?.toLocaleDateString() || "None"}</Td>
          </Tr>

          <Tr>
            <Td>Scene URI</Td>
            <Td>{placement.sceneUri || "None"}</Td>
          </Tr>

          <Tr>
            <Td>Placement Transaction</Td>
            <Td>
              <Link href={gsrIndexer.blockExplorerUrlForPlacement(placement)}>
                {placement.tx}
              </Link>
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <Heading as="h2" mt={6} mb={3}>
        Placement History
      </Heading>

      {historyFeatures && historyFeatures.data.features.length > 0 && (
        <GsrMap features={historyFeatures} />
      )}

      {!history && (
        <Box height="100px">
          <CenteredSpinner />
        </Box>
      )}
      {history && history.length === 0 && <Text>No Placements</Text>}

      {history && history.length > 0 && (
        <Table>
          <Thead>
            <Tr>
              <Td>Publisher</Td>
              <Td>Placed At</Td>
              <Td>Latitude</Td>
              <Td>Longitude</Td>
              <Td>Scene URI</Td>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((placement) => {
              const coords = decode_int(
                placement.location.geohash,
                placement.location.bitPrecision
              );

              return (
                <Tr key={placement.blockNumber}>
                  <Td>{placement.publisher}</Td>
                  <Td>
                    {placement.placedAt.toLocaleDateString()}{" "}
                    {placement.placedAt.toLocaleTimeString()}
                  </Td>
                  <Td>{coords.latitude}</Td>
                  <Td>{coords.longitude}</Td>
                  <Td>{placement.sceneUri}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Layout>
  );
};

export default AssetIdPage;

export const getServerSideProps: GetServerSideProps<AssetIdPageProps> = async (
  context
) => {
  const { assetId } = context.params as Record<string, string>;

  const { statusCode, body } = await getPlacementByAssetId(assetId).catch(
    fetchCatchResponse
  );

  if (statusCode === 404) {
    return {
      notFound: true,
    };
  } else if (body.status === "success") {
    return {
      props: {
        serializedPlacement: body.data,
      },
    };
  } else {
    return {
      props: {
        serializedPlacement: null,
        errorMessage: body.message,
      },
    };
  }
};

/** Fetch placement history */
const usePlacementHistory = (assetId?: string) => {
  const [placements, setPlacements] = useState<ValidatedGsrPlacement[] | null>(
    null
  );

  useEffect(() => {
    if (!assetId) {
      setPlacements(null);
      return;
    }

    gsrIndexer
      .getPlacementHistory(assetId)
      .then(setPlacements)
      .catch(() => setPlacements(null));
  }, [assetId]);

  return placements;
};

const useHistoryMap = (assetId?: string) => {
  const [geojson, setFeatures] = useState<GeoJsonFeaturesCollection | null>();

  useEffect(() => {
    if (!assetId) {
      setFeatures(null);
      return;
    }

    gsrIndexer.getPlacementHistoryGeoJson(assetId).then((features) => {
      setFeatures(features);
    });
  }, [assetId]);

  return geojson;
};
