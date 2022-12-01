#!/bin/sh
DAY=${1:?No day provided}
DAY_NUMBER_ONLY=$(echo "$DAY" | sed 's/[a-z]//')

SUFFIX=".txt"
if [[ $2 == "test" ]]; then SUFFIX="test.txt"; fi

if [[ -e "input/${DAY}${SUFFIX}" ]]; then
    FILENAME="input/${DAY}${SUFFIX}"
else
    FILENAME="input/${DAY_NUMBER_ONLY}${SUFFIX}"
fi

deno run --allow-read=input "src/day$DAY.ts" "$FILENAME"
