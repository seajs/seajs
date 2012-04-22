#/bin/bash
#usage: ./size.sh

SRC=sea-debug.js
MIN=sea.js

SIZE_SRC=$(cat build/$SRC | wc -c)
SIZE_MIN=$(cat build/$MIN | wc -c)
SIZE_GZIP=$(gzip -nfc --best build/$MIN | wc -c)

echo "    `echo "scale=3;$SIZE_SRC/1024" | bc -l` bytes $SRC"
echo "    `echo "scale=3;$SIZE_MIN/1024" | bc -l` bytes $MIN"
echo "     `echo "scale=3;$SIZE_GZIP/1024" | bc -l` bytes $MIN gzipped"
