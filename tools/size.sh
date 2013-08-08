#/bin/bash
#usage: ./tools/size.sh

SRC=$1-debug.js
MIN=$1.js

SIZE_SRC=$(cat dist/$SRC | wc -c)
SIZE_MIN=$(cat dist/$MIN | wc -c)
SIZE_GZIP=$(gzip -c1 dist/$MIN | wc -c)

echo
echo "\t`echo "scale=3;$SIZE_SRC/1024" | bc -l` KB $SRC"
echo "\t`echo "scale=3;$SIZE_MIN/1024" | bc -l` KB $MIN"
echo "\t`echo "scale=3;$SIZE_GZIP/1024" | bc -l` KB $MIN gzipped"
echo "\t`cat dist/$1-debug.js | wc -l` LOC"
echo
