// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";
import { compress, computeAdjacent, loadInput, move, Rotation, run, Tiles } from "./day22a.ts";

function computeAdjacentTileOnTestCube(
    m: Tiles,
    [x, y]: [number, number],
    dir: Rotation,
): [x: number, y: number, r: Rotation | null] {
    let [nx, ny] = move([x, y], dir);
    let nr: Rotation | null = null;

    if (!m.has(compress([nx, ny]))) {
        //              1111111
        //     1234567890123456
        //  -------------------
        //  1 |        1111
        //  2 |        1111
        //  3 |        1111
        //  4 |        1111
        //  5 |222233334444
        //  6 |222233334444
        //  7 |222233334444
        //  8 |222233334444
        //  9 |        55556666
        // 10 |        55556666
        // 11 |        55556666
        // 12 |        55556666
        //
        //        ↓1
        //  +--------+\
        //  |\     2   \
        //  | \+--------+
        //  |  |        |
        //  +3 |   5    | ←6
        //   \ |        |
        //    \+--------+
        //        ↑4

        // Yes, listing all the wrap-around edges

        if (y === 1 && x >= 9 && x <= 12 && dir === "u") {
            // 1-top → 2-top
            ny = 5;
            nx = 13 - x;
            nr = "d";
        } else if (x === 9 && y >= 1 && y <= 4 && dir === "l") {
            // 1-left → 3-top
            ny = 5;
            nx = y + 4; // 4→8 1→5
            nr = "d";
        } else if (y === 5 && x >= 5 && x <= 8 && dir === "u") {
            // 3-top → 1-left
            ny = x - 4; // 8→4 5→1
            nx = 9;
            nr = "r";
        } else if (y === 5 && x >= 1 && x <= 4 && dir === "u") {
            // 2-top → 1-top
            ny = 1;
            nx = 13 - x;
            nr = "d";
        } else if (x === 1 && y >= 5 && y <= 8 && dir === "l") {
            // 2-left → 6-bottom
            ny = 12;
            nx = 21 - y; //5→16 8→13
            nr = "u";
        } else if (y === 8 && x >= 1 && x <= 4 && dir === "d") {
            // 2-bottom → 5-bottom
            ny = 12;
            nx = 13 - x;
            nr = "u";
        } else if (y === 8 && x >= 5 && x <= 8 && dir === "d") {
            // 3-bottom → 5-left
            ny = 17 - x;
            nx = 9;
            nr = "r";
        } else if (x === 9 && y >= 9 && y <= 12 && dir === "l") {
            // 5-left → 3-bottom
            ny = 8;
            nx = 17 - y;
            nr = "u";
        } else if (y === 12 && x >= 9 && x <= 12 && dir === "d") {
            // 5-bottom → 2-bottom
            ny = 8;
            nx = 13 - x;
            nr = "u";
        } else if (y === 12 && x >= 13 && x <= 16 && dir === "d") {
            // 6-bottom → 2-left
            ny = 21 - x; //13→8 16→5
            nx = 1;
            nr = "r";
        } else if (x === 16 && y >= 9 && y <= 12 && dir === "r") {
            // 6-right → 1-right
            ny = 13 - y; // 9→4 12→1
            nx = 12;
            nr = "l";
        } else if (y === 9 && x >= 13 && x <= 16 && dir === "u") {
            // 6-bottom → 4-right
            ny = 21 - x; // 13→8 16→5
            nx = 12;
            nr = "l";
        } else if (x === 12 && y >= 5 && y <= 8 && dir === "r") {
            // 4-right → 6-bottom
            ny = 9;
            nx = 21 - y; // 8→13 5→16
            nr = "d";
        } else if (x === 12 && y >= 1 && y <= 4 && dir === "r") {
            // 1-right → 6-right
            ny = 13 - y; // 4→9 1→12
            nx = 16;
            nr = "l";
        } else {
            throw `Unknown edge step: x=${x} y=${y} dir=${dir}`;
        }
    }

    const neighborTile = m.get(compress([nx, ny]));
    if (neighborTile === undefined) {
        throw `Edge wraparound to non-existing tile: [${x} ${y} ${dir}] → [${nx} ${ny} ${nr}]`;
    } else if (neighborTile === "#") {
        return [x, y, null];
    } else {
        return [nx, ny, nr];
    }
}

function computeAdjacentTileOnProdCube(
    m: Tiles,
    [x, y]: [number, number],
    dir: Rotation,
): [x: number, y: number, r: Rotation | null] {
    let [nx, ny] = move([x, y], dir);
    let nr: Rotation | null = null;

    if (!m.has(compress([nx, ny]))) {
        //
        // \          11  1
        //  \ X   55  00  5
        // Y \ 1..01..01..0
        //    +------------
        //   1|    11112222
        //   .|    11112222
        //   .|    11112222
        //  50|    11112222
        //  51|    3333
        //   .|    3333
        //   .|    3333
        // 100|    3333
        // 101|44445555
        //   .|44445555
        //   .|44445555
        // 150|44445555
        // 151|6666
        //   .|6666
        //   .|6666
        // 200|6666
        //
        //
        //        ↓1
        //  +--------+\
        //  |\     3   \
        //  | \+--------+
        //  |  |        |
        //  +4 |   5    | ←2
        //   \ |        |
        //    \+--------+
        //        ↑6
        //
        // My spatial imagination was incapable of thinking about all the edge connections,
        // so I made a paper cut-out of the cube :^)

        if (x === 50 && y >= 151 && y <= 200 && dir === "r") {
            // 6R - 5D
            nx = y - 100; // 151-51 200-100
            ny = 150;
            nr = "u";
        } else if (x >= 1 && x <= 50 && y === 200 && dir === "d") {
            // 6D - 2U
            nx = x + 100; // 1-101 50-150
            ny = 1;
            nr = "d";
        } else if (x === 1 && y >= 151 && y <= 200 && dir === "l") {
            // 6L - 1U
            nx = y - 100; // 151-51 200-100
            ny = 1;
            nr = "d";
        } else if (x === 100 && y >= 101 && y <= 150 && dir === "r") {
            // 5R - 2R
            nx = 150;
            ny = 151 - y; // 101-50 150-1
            nr = "l";
        } else if (x >= 51 && x <= 100 && y === 150 && dir === "d") {
            // 5D - 6R
            nx = 50;
            ny = x + 100; // 51-151 100-200
            nr = "l";
        } else if (x >= 1 && x <= 50 && y === 101 && dir === "u") {
            // 4U - 3L
            nx = 51;
            ny = x + 50; // 1-51 50-100
            nr = "r";
        } else if (x === 1 && y >= 101 && y <= 150 && dir === "l") {
            // 4L - 1L
            nx = 51;
            ny = 151 - y; // 101-50 150-1
            nr = "r";
        } else if (x === 100 && y >= 51 && y <= 100 && dir === "r") {
            // 3R - 2D
            nx = y + 50; // 51-101 100-150
            ny = 50;
            nr = "u";
        } else if (x === 51 && y >= 51 && y <= 100 && dir === "l") {
            // 3L - 4U
            nx = y - 50; // 51-1 100-50
            ny = 101;
            nr = "d";
        } else if (x >= 101 && x <= 150 && y === 1 && dir === "u") {
            // 2U - 6D
            nx = x - 100; // 101-1 150-50
            ny = 200;
            nr = "u";
        } else if (x === 150 && y >= 1 && y <= 50 && dir === "r") {
            // 2R - 5R
            nx = 100;
            ny = 151 - y; // 1-150 50-101
            nr = "l";
        } else if (x >= 101 && x <= 150 && y === 50 && dir === "d") {
            // 2D - 3R
            nx = 100;
            ny = x - 50; // 101-51 150-100
            nr = "l";
        } else if (x >= 51 && x <= 100 && y === 1 && dir === "u") {
            // 1U - 6L
            nx = 1;
            ny = x + 100; // 51-151 100-200
            nr = "r";
        } else if (x === 51 && y >= 1 && y <= 50 && dir === "l") {
            // 1L - 4L
            nx = 1;
            ny = 151 - y; // 50-101 1-150
            nr = "r";
        } else {
            throw `Unknown edge step: x=${x} y=${y} dir=${dir}`;
        }
    }

    const neighborTile = m.get(compress([nx, ny]));
    if (neighborTile === undefined) {
        throw `Edge wraparound to non-existing tile: [${x} ${y} ${dir}] → [${nx} ${ny} ${nr}]`;
    } else if (neighborTile === "#") {
        return [x, y, null];
    } else {
        return [nx, ny, nr];
    }
}

export function main(): void {
    const [tiles, instructions] = loadInput(linesFromFile(Deno.args[0]));
    const adjacent = computeAdjacent(
        tiles,
        Deno.args[0].match(/test/i)
            ? computeAdjacentTileOnTestCube
            : computeAdjacentTileOnProdCube,
    );
    const result = run(adjacent, instructions);
    console.log(result);
}
