#!/bin/sh
DAY=${1:?No day provided}
DAY_NUMBER_ONLY=$(echo "$DAY" | sed 's/[a-z]//')

SUFFIX=".txt"
if [ "$2" = "test" ]; then SUFFIX="test.txt"; fi

if [ -e "input/${DAY}${SUFFIX}" ]; then
    FILENAME="input/${DAY}${SUFFIX}"
else
    FILENAME="input/${DAY_NUMBER_ONLY}${SUFFIX}"
fi

echo "import { main } from \"./src/day$DAY.ts\"; main();" |
    deno run '--v8-flags=--max-heap-size=8192' --allow-read=input - "$FILENAME"
