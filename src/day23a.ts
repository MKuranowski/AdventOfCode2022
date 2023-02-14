import { enumerate, linesFromFile } from "./core.ts";

export type Coords = [x: number, y: number];

export type CompressedCoords = `${number}:${number}`;

export const compress = ([x, y]: Coords): CompressedCoords => `${x}:${y}`;
export const decompress = (a: CompressedCoords): Coords =>
    a.split(":").map((x) => parseInt(x, 10)) as Coords;

export type Dir = "N" | "S" | "W" | "E";

function moveIn([x, y]: Coords, d: Dir): Coords {
    switch (d) {
        case "N":
            return [x, y - 1];
        case "S":
            return [x, y + 1];
        case "W":
            return [x - 1, y];
        case "E":
            return [x + 1, y];
    }
}

function lookIn([x, y]: Coords, d: Dir): Coords[] {
    switch (d) {
        case "N":
            return [[x - 1, y - 1], [x, y - 1], [x + 1, y - 1]];
        case "S":
            return [[x - 1, y + 1], [x, y + 1], [x + 1, y + 1]];
        case "W":
            return [[x - 1, y - 1], [x - 1, y], [x - 1, y + 1]];
        case "E":
            return [[x + 1, y - 1], [x + 1, y], [x + 1, y + 1]];
    }
}

function allAround([x, y]: Coords): Coords[] {
    return [
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
        [x - 1, y],
        [x + 1, y],
        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1],
    ];
}

export class State {
    order: Dir[] = ["N", "S", "W", "E"];

    constructor(public m: Set<CompressedCoords>) {}

    getProposedTargets(e: Coords): { check: Coords[]; to: Coords | null }[] {
        return [
            { check: allAround(e), to: null },
            ...this.order.map((d) => {
                return {
                    check: lookIn(e, d),
                    to: moveIn(e, d),
                };
            }),
            { check: [], to: null },
        ];
    }

    proposeMoves(): Map<CompressedCoords | "", CompressedCoords[]> {
        const proposed: Map<CompressedCoords | "", CompressedCoords[]> = new Map();

        for (const elf of this.m) {
            const elfCoords = decompress(elf);

            const to = this.getProposedTargets(elfCoords).find((p) =>
                p.check.every((c) =>
                    !this.m.has(compress(c))
                )
            )!.to;
            const toKey = to === null ? "" : compress(to);

            const queue = proposed.get(toKey);
            if (queue === undefined) {
                proposed.set(toKey, [elf]);
            } else {
                queue.push(elf);
            }
        }

        return proposed;
    }

    applyProposedMoves(p: Map<CompressedCoords | "", CompressedCoords[]>): boolean {
        const newM: Set<CompressedCoords> = new Set();
        let didMove = false;

        for (const [target, elves] of p) {
            if (target === "") {
                // Special key for elves that don't move
                elves.forEach((e) => newM.add(e));
            } else if (elves.length === 1) {
                // Only 1 elf to move to that target
                newM.add(target);
                didMove = true;
            } else {
                // Multiple elves want to move to that target - each elf stays
                elves.forEach((e) => newM.add(e));
            }
        }

        if (this.m.size !== newM.size) throw "Different number of elves between moves!";

        this.m = newM;
        return didMove;
    }

    move(): boolean {
        const didMove = this.applyProposedMoves(this.proposeMoves());
        this.order.push(this.order.shift()!);
        return didMove;
    }

    bbox(): [t: number, r: number, b: number, l: number] {
        let t: number = Number.MAX_SAFE_INTEGER;
        let r: number = Number.MIN_SAFE_INTEGER;
        let b: number = Number.MIN_SAFE_INTEGER;
        let l: number = Number.MAX_SAFE_INTEGER;

        for (const elf of this.m) {
            const [x, y] = decompress(elf);

            t = Math.min(y, t);
            b = Math.max(y, b);
            r = Math.max(x, r);
            l = Math.min(x, l);
        }

        return [t, r, b, l];
    }

    countEmptyTilesInBbox(): number {
        const [t, r, b, l] = this.bbox();
        return (r - l + 1) * (b - t + 1) - this.m.size;
    }

    printM(): void {
        // const [t, r, b, l] = this.bbox();
        const [t, r, b, l] = [-2, 10, 9, -3];
        const lines: string[] = [];
        for (let y = t; y <= b; ++y) {
            const line: ("#" | ".")[] = [];
            for (let x = l; x <= r; ++x) {
                const hasElf = this.m.has(compress([x, y]));
                line.push(hasElf ? "#" : ".");
            }
            lines.push(line.join(""));
        }
        console.log(lines.join("\n"));
    }

    static fromInput(): State {
        const m: Set<CompressedCoords> = new Set();
        for (const [y, row] of enumerate(linesFromFile(Deno.args[0]))) {
            for (const [x, tile] of enumerate(row)) {
                if (tile === "#") {
                    m.add(compress([x, y]));
                }
            }
        }
        return new State(m);
    }
}

export function main() {
    const s = State.fromInput();
    for (let i = 0; i < 10; ++i) {
        s.move();
    }
    console.log(s.countEmptyTilesInBbox());
}
