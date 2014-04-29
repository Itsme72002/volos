#!/bin/sh

# Used by link.sh. You may also exec directly to remove node_modules symlinks to volos modules.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd "$DIR/node_modules"

rm -f volos-management-apigee
rm -f volos-management-redis
rm -f volos-management-common

rm -f volos-oauth-apigee
rm -f volos-oauth-common
rm -f volos-oauth-redis

rm -f volos-quota-apigee
rm -f volos-quota-common
rm -f volos-quota-memory
rm -f volos-quota-redis

rm -f volos-cache-common
rm -f volos-cache-memory
rm -f volos-cache-redis

popd
