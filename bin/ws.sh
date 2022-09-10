#! /usr/bin/env bash

# Prefix the given workspace with @geospatialregistry/
command="yarn workspace @geospatialregistry/$@"

echo $command
$command
