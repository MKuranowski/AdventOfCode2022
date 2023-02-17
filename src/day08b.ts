// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";
import { directions, treesInDirection } from "./day08a.ts";

export function main(): void {
    const trees = linesFromFile(Deno.args[0]).map((i) => i.split("").map((t) => parseInt(t, 10)));
    let bestScore = 0;

    const height = trees.length;
    const width = trees[0].length;

    for (let row = 0; row < height; ++row) {
        for (let col = 0; col < width; ++col) {
            let score = 1;
            for (const direction of directions()) {
                const inDirection = [...treesInDirection(trees, row, col, direction)];
                const blockingIdx = inDirection.findIndex(i => i >= trees[row][col]);
                score *= blockingIdx < 0 ? inDirection.length : blockingIdx+1;
            }

            if (score > bestScore) bestScore = score;
        }
    }

    console.log(bestScore);
}
