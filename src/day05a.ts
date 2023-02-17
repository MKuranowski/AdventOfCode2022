// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile, splitOn } from "./core.ts";

export type Crate = string[];
export type Move = {
    count: number;
    from: number;
    to: number;
};

export function loadInput(): [Crate[], Move[]] {
    const [rawCrates, rawMoves] = splitOn(linesFromFile(Deno.args[0]), (x) => x === "");

    const crates: Crate[] = rawCrates.map(i => i.split(""));
    const moves: Move[] = [];
    for (const i of rawMoves) {
        const match = i.match(/move (\d+) from (\d+) to (\d+)/);
        if (match === null) throw `Invalid move: ${i}`;
        moves.push({
            count: parseInt(match[1], 10),
            from: parseInt(match[2], 10)-1,
            to: parseInt(match[3], 10)-1,
        });
    }

    return [crates, moves];
}

export function performMoves(crates: Crate[], moves: Move[]) {
    for (const move of moves) {
        for (let i = 0; i < move.count; ++i)
            crates[move.to].push(crates[move.from].pop()!)
    }
}

export function readTops(crates: Crate[]): string {
    return crates.map(i => i.at(-1)).join("");
}

export function main(): void {
    const [crates, moves] = loadInput();
    performMoves(crates, moves);
    console.log(readTops(crates));
}
