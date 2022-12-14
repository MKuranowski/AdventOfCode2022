import { linesFromFile, pairwise } from "./core.ts";

// Simulation bounds:
// X: [400, 600]
// Y: [0, 200]

export const LEFT = 400;
export const RIGHT = 600;
export const TOP = 0;
export const BOTTOM = 200;

export type PackedCoords = number;

export const pack = (x: number, y: number): PackedCoords => (x << 8) | y;
export const unpack = (a: PackedCoords) => [a >> 8, a & 0xFF];

export class Simulation {
    rocks: Set<PackedCoords> = new Set();
    sand: Set<PackedCoords> = new Set();
    finished = false;
    floor = 0;

    addRocksFromLine(l: string): void {
        for (const [aStr, bStr] of pairwise(l.split(" -> "))) {
            const [axStr, ayStr] = aStr.split(",");
            const [bxStr, byStr] = bStr.split(",");
            const ax = parseInt(axStr, 10);
            const ay = parseInt(ayStr, 10);
            const bx = parseInt(bxStr, 10);
            const by = parseInt(byStr, 10);

            if (ax === bx) {
                // Horizontal line
                const endY = Math.max(ay, by);
                for (let y = Math.min(ay, by); y <= endY; ++y) {
                    this.rocks.add(pack(ax, y));
                }
            } else if (ay === by) {
                // Vertical line
                const endX = Math.max(ax, bx);
                for (let x = Math.min(ax, bx); x <= endX; ++x) {
                    this.rocks.add(pack(x, ay));
                }
            } else {
                throw `Unsupported diagonal line: ${aStr} -> ${bStr}`;
            }

            // Update floor height
            const floorCandidate = Math.max(ay, by) + 2;
            if (floorCandidate > this.floor) this.floor = floorCandidate;
        }
    }

    isBlockedPartA(x: number, y: number): boolean {
        const a = pack(x, y);
        return this.rocks.has(a) || this.sand.has(a);
    }

    dropSandPartA(): void {
        if (this.finished) return;

        let x = 500;
        let y = 0;

        while (true) {
            if (!this.isBlockedPartA(x, y + 1)) {
                // Fall directly below
                ++y;
            } else if (!this.isBlockedPartA(x - 1, y + 1)) {
                // Fall to the left and below
                --x;
                ++y;
            } else if (!this.isBlockedPartA(x + 1, y + 1)) {
                // Fall to the right below
                ++x;
                ++y;
            } else {
                // Sand has settled
                this.sand.add(pack(x, y));
                break;
            }

            // Sand has moved - check if fallen into abyss
            if (x < LEFT || x > RIGHT || y > BOTTOM) {
                this.finished = true;
                break;
            }
        }
    }

    isBlockedPartB(x: number, y: number): boolean {
        const a = pack(x, y);
        return y >= this.floor || this.rocks.has(a) || this.sand.has(a);
    }

    dropSandPartB(): void {
        if (this.finished) return;

        let x = 500;
        let y = 0;

        while (true) {
            if (!this.isBlockedPartB(x, y + 1)) {
                // Fall directly below
                ++y;
            } else if (!this.isBlockedPartB(x - 1, y + 1)) {
                // Fall to the left and below
                --x;
                ++y;
            } else if (!this.isBlockedPartB(x + 1, y + 1)) {
                // Fall to the right below
                ++x;
                ++y;
            } else {
                // Sand has settled
                this.sand.add(pack(x, y));
                if (x === 500 && y === 0) this.finished = true;
                break;
            }
        }
    }
}

export function main(): void {
    const sim = new Simulation();
    linesFromFile(Deno.args[0]).forEach((l) => sim.addRocksFromLine(l));

    while (!sim.finished) sim.dropSandPartA();
    console.log(sim.sand.size);
}
