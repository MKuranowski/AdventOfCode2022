// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { enumerate, linesFromFile, MinHeap } from "./core.ts";

export type Coords = [x: number, y: number];
export type CompressedCoords = `${number}:${number}`;

export const compress = ([x, y]: Coords): CompressedCoords => `${x}:${y}`;
export const decompress = (a: CompressedCoords): Coords =>
    a.split(":").map((x) => parseInt(x, 10)) as Coords;

const manhattan = ([ax, ay]: Coords, [bx, by]: Coords): number =>
    Math.abs(by - ay) + Math.abs(bx - ax);

type Wind = "<" | ">" | "^" | "v";
type Maze = Map<CompressedCoords, Wind[]>;

export type CompressedSearchState = `${number}:${number}:${number}`;

export class SearchState {
    constructor(public x: number, public y: number, public t: number) {}

    compress(): CompressedSearchState {
        return `${this.x}:${this.y}:${this.t}`;
    }

    static decompress(a: CompressedSearchState): SearchState {
        const [x, y, t] = a.split(":").map((x) => parseInt(x, 10));
        return new SearchState(x, y, t);
    }

    *neighbors(): Generator<SearchState, void, void> {
        yield new SearchState(this.x, this.y, this.t + 1);
        yield new SearchState(this.x + 1, this.y, this.t + 1);
        yield new SearchState(this.x - 1, this.y, this.t + 1);
        yield new SearchState(this.x, this.y + 1, this.t + 1);
        yield new SearchState(this.x, this.y - 1, this.t + 1);
    }
}

export class Mazes {
    readonly maxTime = 1000;

    freeTiles: Set<CompressedSearchState> = new Set();
    rightWall = 0;
    bottomWall = 0;

    private moveIn([x, y]: Coords, w: Wind): Coords {
        switch (w) {
            case "<":
                --x;
                break;
            case ">":
                ++x;
                break;
            case "^":
                --y;
                break;
            case "v":
                ++y;
                break;
        }

        // Wraparound
        if (x === 0) x = this.rightWall - 1;
        if (x === this.rightWall) x = 1;
        if (y === 0) y = this.bottomWall - 1;
        if (y === this.bottomWall) y = 1;

        return [x, y];
    }

    private simulateTime(m: Maze): Maze {
        const n: Maze = new Map();

        for (const [compressedCoords, winds] of m) {
            const coords = decompress(compressedCoords);
            for (const wind of winds) {
                const newCoords = compress(this.moveIn(coords, wind));
                const windsAt = n.get(newCoords);
                if (windsAt === undefined) {
                    n.set(newCoords, [wind]);
                } else {
                    windsAt.push(wind);
                }
            }
        }

        return n;
    }

    private addFreeTiles(m: Maze, t: number) {
        for (let y = 1; y < this.bottomWall; ++y) {
            for (let x = 1; x < this.rightWall; ++x) {
                const winds = m.get(compress([x, y]))?.length ?? 0;
                if (winds === 0) {
                    this.freeTiles.add(new SearchState(x, y, t).compress());
                }
            }
        }
    }

    static fromInput(): Mazes {
        // Load the initial maze
        const o = new Mazes();
        let m: Maze = new Map();

        for (const [y, row] of enumerate(linesFromFile(Deno.args[0]))) {
            for (const [x, tile] of enumerate(row)) {
                o.rightWall = Math.max(o.rightWall, x);
                switch (tile) {
                    case "<":
                    case ">":
                    case "^":
                    case "v":
                        m.set(compress([x, y]), [tile]);
                        break;
                }
            }
            o.bottomWall = Math.max(o.bottomWall, y);
        }

        // Add the set of free tiles at t=0
        o.addFreeTiles(m, 0);

        // Simulate the board and add tiles
        for (let t = 1; t <= o.maxTime; ++t) {
            m = o.simulateTime(m);
            o.addFreeTiles(m, t);
        }

        return o;
    }

    isAlwaysFree([x, y]: Coords): boolean {
        return (y === this.bottomWall && x === this.rightWall - 1) || (y === 0 && x === 1);
    }

    isFree(s: SearchState): boolean {
        if (s.t > this.maxTime) throw `Time overflow`;
        return this.isAlwaysFree([s.x, s.y]) || this.freeTiles.has(s.compress());
    }
}

export function dijkstraSearch(m: Mazes, start: SearchState, [endX, endY]: Coords): SearchState {
    const visited: Set<CompressedSearchState> = new Set();
    const queue: MinHeap<SearchState> = new MinHeap(
        (a, b) =>
            a.t === b.t
                ? (manhattan([a.x, a.y], [endX, endY]) < manhattan([b.x, b.y], [endX, endY]))
                : (a.t < b.t),
    );

    // Insert the first state (x: 1, y: 0, t: 0)
    queue.push(start);

    while (queue.length > 0) {
        const s = queue.pop();

        if (visited.has(s.compress())) continue;

        // Check if end was reached
        if (s.x === endX && s.y === endY) {
            return s;
        }

        visited.add(s.compress());

        // Add neighbors
        for (const ns of s.neighbors()) {
            if (visited.has(ns.compress()) || !m.isFree(ns)) {
                continue;
            }

            queue.push(ns);
        }
    }

    throw "No solution";
}

export function main(): void {
    const m = Mazes.fromInput();
    console.log(dijkstraSearch(m, new SearchState(1, 0, 0), [m.rightWall - 1, m.bottomWall]).t);
}
