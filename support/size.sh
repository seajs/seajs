#/bin/bash
#usage: ./size.sh

SRC=sea-debug.js
MIN=sea.js

SIZE_SRC=$(cat build/$SRC | wc -c)
SIZE_MIN=$(cat build/$MIN | wc -c)
SIZE_GZIP=$(gzip -nfc --best build/$MIN | wc -c)

echo "$SIZE_SRC bytes $SRC"
echo "$SIZE_MIN bytes $MIN"
echo "$SIZE_GZIP bytes $MIN gzipped"
