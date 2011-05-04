#!/bin/sh

WD=`cd \`dirname "$0"\`; pwd`
~/local/node/bin/node $WD/../bin/extract.js $@
