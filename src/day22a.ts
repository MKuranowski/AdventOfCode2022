// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { enumerate, linesFromFile } from "./core.ts";

// export type CompressedCoords = number;

// export function compress([x, y]: [number, number]): CompressedCoords {
//     return y << 8 | x;
// }

// export function decompress(c: CompressedCoords): [x: number, y: number] {
//     return [c & 0xFF, c >> 8];
// }

export type CompressedCoords = string;

export function compress([x, y]: [number, number]): CompressedCoords {
    return `${x},${y}`;
}

export function decompress(c: CompressedCoords): [x: number, y: number] {
    const [xs, ys] = c.split(",");
    return [parseInt(xs, 10), parseInt(ys, 10)];
}

export type Rotation = "r" | "d" | "l" | "u";

export function rotate(curr: Rotation, direction: "L" | "R"): Rotation {
    switch (curr) {
        case "r":
            return direction === "R" ? "d" : "u";
        case "d":
            return direction === "R" ? "l" : "r";
        case "l":
            return direction === "R" ? "u" : "d";
        case "u":
            return direction === "R" ? "r" : "l";
    }
}

export function rotationValue(r: Rotation): number {
    return {
        r: 0,
        d: 1,
        l: 2,
        u: 3,
    }[r];
}

export function move([x, y]: [number, number], dir: Rotation): [x: number, y: number] {
    switch (dir) {
        case "r":
            return [x + 1, y];
        case "d":
            return [x, y + 1];
        case "l":
            return [x - 1, y];
        case "u":
            return [x, y - 1];
    }
}

export type Tiles = Map<CompressedCoords, "." | "#">;
export type Adjacent = Map<
    CompressedCoords,
    { [K in Rotation]: [x: number, y: number, r: Rotation | null] }
>;

export type Instruction = number | "R" | "L";

function parseInstructions(s: string): Instruction[] {
    const re = /\d+|L|R/g;
    const instructions: Instruction[] = [];
    let m: RegExpExecArray | null = null;
    while ((m = re.exec(s))) {
        const i = m[0];
        if (i === "L" || i === "R") {
            instructions.push(i);
        } else {
            instructions.push(parseInt(i, 10));
        }
    }
    return instructions;
}

function computeAdjacentTileOnPlane(
    m: Tiles,
    coords: [number, number],
    dir: Rotation,
): [x: number, y: number, r: Rotation | null] {
    let neighbor = move(coords, dir);

    if (!m.has(compress(neighbor))) {
        // Start moving in the opposite direction to find the wraparound
        const opp = rotate(rotate(dir, "R"), "R");
        neighbor = coords;
        let candidate = move(neighbor, opp);
        while (m.has(compress(candidate))) {
            neighbor = candidate;
            candidate = move(neighbor, opp);
        }
    }

    const neighborTile = m.get(compress(neighbor));
    if (neighborTile === undefined) {
        throw `Edge wraparound to non-existing tile: ${coords} → ${neighbor}`;
    } else if (neighborTile === "#") {
        return [...coords, null];
    } else {
        return [...neighbor, null];
    }
}

export function computeAdjacent(
    tiles: Tiles,
    computeAdjacent: (
        t: Tiles,
        pos: [number, number],
        dir: Rotation,
    ) => [x: number, y: number, r: Rotation | null],
): Adjacent {
    const adj: Adjacent = new Map();
    for (const [coords, typ] of tiles) {
        if (typ === "#") continue;
        const coordsArr = decompress(coords);
        adj.set(coords, {
            r: computeAdjacent(tiles, coordsArr, "r"),
            d: computeAdjacent(tiles, coordsArr, "d"),
            l: computeAdjacent(tiles, coordsArr, "l"),
            u: computeAdjacent(tiles, coordsArr, "u"),
        });
    }
    return adj;
}

export function loadInput(lines: string[]): [Tiles, Instruction[]] {
    // Parse instructions first
    const instructions = parseInstructions(lines.pop()!);

    // Remove the empty line separator
    lines.pop();

    // Parse the tiles
    const tiles: Tiles = new Map();

    for (const [y, row] of enumerate(lines, 1)) {
        for (const [x, tile] of enumerate(row, 1)) {
            switch (tile) {
                case " ":
                    break;

                case ".":
                case "#":
                    tiles.set(compress([x, y]), tile);
                    break;

                default:
                    throw `Unexpected tile char: ${tile}`;
            }
        }
    }

    return [tiles, instructions];
}

export function findStart(t: Adjacent): [x: number, y: number] {
    for (let x = 1; x < 200; ++x) {
        if (t.has(compress([x, 1]))) return [x, 1];
    }
    throw "no start tile";
}

export function run(m: Adjacent, i: Instruction[]): number {
    let rot: Rotation = "r";
    let pos = findStart(m);

    for (const instr of i) {
        if (typeof instr === "number") {
            for (let step = 0; step < instr; ++step) {
                const [nx, ny, nr]: [number, number, Rotation | null] = m.get(compress(pos))![rot];
                pos = [nx, ny];
                rot = nr ?? rot;
            }
        } else {
            rot = rotate(rot, instr);
        }
    }

    // return [pos, rot];
    return 1000 * pos[1] + 4 * pos[0] + rotationValue(rot);
}

export function main(): void {
    const [tiles, instructions] = loadInput(linesFromFile(Deno.args[0]));
    const adjacent = computeAdjacent(tiles, computeAdjacentTileOnPlane);
    const result = run(adjacent, instructions);
    console.log(result);
}
