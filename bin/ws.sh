#! /usr/bin/env bash

# Prefix the given workspace with @gsr/
command="yarn workspace @gsr/$@"

echo $command
$command
