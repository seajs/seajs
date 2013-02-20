#/bin/bash
#usage: ./tools/size.sh

SRC=sea-debug.js
MIN=sea.js

SIZE_SRC=$(cat dist/$SRC | wc -c)
SIZE_MIN=$(cat dist/$MIN | wc -c)
SIZE_GZIP=$(gzip -nfc --best dist/$MIN | wc -c)

echo "    `echo "scale=3;$SIZE_SRC/1024" | bc -l` bytes $SRC"
echo "     `echo "scale=3;$SIZE_MIN/1024" | bc -l` bytes $MIN"
echo "     `echo "scale=3;$SIZE_GZIP/1024" | bc -l` bytes $MIN gzipped"
echo "  `cat dist/sea-debug.js | wc -l` LOC"