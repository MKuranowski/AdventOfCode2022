// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { enumerate, linesFromFile, MinHeap } from "./core.ts";

export type Coords = [row: number, col: number];
export type Board = string[][];

export function findStartEnd(m: Board): [Coords, Coords] {
    let start: Coords | null = null;
    let end: Coords | null = null;

    for (const [i, row] of enumerate(m)) {
        for (const [j, pos] of enumerate(row)) {
            if (pos === "S") {
                m[i][j] = "a";
                start = [i, j];
            }
            if (pos === "E") {
                m[i][j] = "z";
                end = [i, j];
            }
        }
    }

    return [start!, end!];
}

export function* neighbors(
    pt: Coords,
    height: number,
    width: number,
): Generator<Coords, void, void> {
    if (pt[0] > 0) yield [pt[0] - 1, pt[1]];
    if (pt[1] > 0) yield [pt[0], pt[1] - 1];
    if (pt[0] + 1 < height) yield [pt[0] + 1, pt[1]];
    if (pt[1] + 1 < width) yield [pt[0], pt[1] + 1];
}

export function bounds(b: Board): [height: number, width: number] {
    return [b.length, Math.min(...b.map((r) => r.length))];
}

export function hashCoords(c: Coords): string {
    return `${c[0]}-${c[1]}`;
}

export type DijkstraEntry = { c: Coords; d: number; i: number };

export function run(partA = true) {
    const b: Board = linesFromFile(Deno.args[0]).map((l) => l.split(""));
    const [start, end] = findStartEnd(b);
    const [height, width] = bounds(b);

    // Dijkstra algorithm
    const entries: Map<string, DijkstraEntry> = new Map();
    const queue: MinHeap<DijkstraEntry> = new MinHeap(
        (a, b) => {
            const aDist = entries.get(hashCoords(a.c))?.d ?? Infinity;
            const bDist = entries.get(hashCoords(b.c))?.d ?? Infinity;
            return aDist < bDist;
        },
        (a, idx) => a.i = idx,
    );

    // Initialize the search
    // In part A we start at `start`, end at `end`
    // In part B we start at `end`, end at any node with height "a"
    const startEntry: DijkstraEntry = { c: partA ? start : end, d: 0, i: NaN };
    entries.set(hashCoords(start), startEntry);
    queue.push(startEntry);

    // Perform the search
    while (queue.length > 0) {
        const popped = queue.pop();
        const poppedHeight = b[popped.c[0]][popped.c[1]].charCodeAt(0);

        // Check for end condition
        // Part A: `end` point reached
        // Part B: popped a node with height "a"
        if (
            (partA && popped.c[0] === end[0] && popped.c[1] === end[1]) ||
            (!partA && poppedHeight == "a".charCodeAt(0))
        ) {
            console.log(popped.d);
            break;
        }

        // Add neighbors
        for (const n of neighbors(popped.c, height, width)) {
            // Check if way is permissable
            // Part A: ascent of up to 1
            // Part B: descent of up to 1
            const nHeight = b[n[0]][n[1]].charCodeAt(0);
            const heightDelta = nHeight - poppedHeight;
            if ((partA && heightDelta > 1) || (!partA && heightDelta < -1)) continue;

            // Calculate alternative cost
            const alt = popped.d + 1;
            const existing = entries.get(hashCoords(n));

            if (existing !== undefined && alt < existing.d) {
                existing.d = alt;
                queue.siftDown(existing.i);
            } else if (existing === undefined) {
                const newEntry: DijkstraEntry = { c: n, d: alt, i: NaN };
                entries.set(hashCoords(n), newEntry);
                queue.push(newEntry);
            }
        }
    }
}

export function main(): void {
    run(true);
}
