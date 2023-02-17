// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";

export enum Direction {
    FROM_LEFT,
    FROM_TOP,
    FROM_RIGHT,
    FROM_BOTTOM,
}

export function* directions(): Generator<Direction, void, void> {
    yield Direction.FROM_LEFT;
    yield Direction.FROM_TOP;
    yield Direction.FROM_RIGHT;
    yield Direction.FROM_BOTTOM;
}

export function* treesInDirection(
    trees: number[][],
    row: number,
    col: number,
    dir: Direction,
): Generator<number, void, void> {
    switch (dir) {
        case Direction.FROM_LEFT:
            for (let i = col-1; i >= 0; --i) yield trees[row][i];
            break;

        case Direction.FROM_RIGHT:
            for (let i = col+1; i < trees[row].length; ++i) yield trees[row][i];
            break;

        case Direction.FROM_TOP:
            for (let i = row-1; i >= 0; --i) yield trees[i][col];
            break;

        case Direction.FROM_BOTTOM:
            for (let i = row+1; i < trees.length; ++i) yield trees[i][col];
            break;
    }
}

export function main(): void {
    const trees = linesFromFile(Deno.args[0]).map((i) => i.split("").map((t) => parseInt(t, 10)));
    let visible = 0;

    const height = trees.length;
    const width = trees[0].length;

    for (let row = 0; row < height; ++row) {
        for (let col = 0; col < width; ++col) {
            for (const direction of directions()) {
                const inDirection = [...treesInDirection(trees, row, col, direction)];
                if (inDirection.length == 0 || Math.max(...inDirection) < trees[row][col]) {
                    ++visible;
                    break;
                }
            }
        }
    }

    console.log(visible);
}
