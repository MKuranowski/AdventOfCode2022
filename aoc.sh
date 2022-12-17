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

# Day 16 is special
if [ "$DAY" = "16a" ]; then
    rustc src/day16.rs -O -o ./src/day16
    deno run --allow-read src/day16_graph_compression.ts <"$FILENAME" | ./src/day16 a
elif [ "$DAY" = "16b" ]; then
    rustc src/day16.rs -O -o ./src/day16
    deno run --allow-read src/day16_graph_compression.ts <"$FILENAME" | ./src/day16 b
else
    echo "import { main } from \"./src/day$DAY.ts\"; main();" | deno run --allow-read=input - "$FILENAME"
fi
