#!/usr/bin/env sh

BOOTSTRAP_ARGS='"--nolazy","--require","aws-sdk","--expose-gc","--max-http-header-size","81920","/var/runtime/index.js"'
if [ "$INSPECT_BRK" != "" ]; then
  ARG="\"--inspect-brk=0.0.0.0:${INSPECT_BRK}\","
fi
BOOTSTRAP_ARGS="[${ARG}${BOOTSTRAP_ARGS}]"
echo $BOOTSTRAP_ARGS
/var/rapid/init --bootstrap /var/lang/bin/node --bootstrap-args "${BOOTSTRAP_ARGS}" $@
