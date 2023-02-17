import { extractIntegers, linesFromFile } from "./core.ts";

export type Overlap = [left: number, right: number];
export type Coords = [x: number, y: number];
export type Reading = [sensor: Coords, beacon: Coords];

export function loadInput(): Reading[] {
    return linesFromFile(Deno.args[0]).map((l) => {
        const [sx, sy, bx, by] = extractIntegers(l);
        return [[sx, sy], [bx, by]];
    });
}

export function dist([ax, ay]: Coords, [bx, by]: Coords): number {
    return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function overlapAtY([sx, sy]: Coords, radius: number, y: number): Overlap | null {
    const dy = Math.abs(sy - y);
    if (dy > radius) return null;

    const leftoverDistance = radius - dy;
    return [sx - leftoverDistance, sx + leftoverDistance];
}

export function overlapsUnion(a: Overlap[]): Overlap[] {
    // https://stackoverflow.com/a/15273749

    const b: Overlap[] = [];
    a.sort(([al, ar], [bl, br]) => al === bl ? ar - br : al - bl);

    for (const [begin, end] of a) {
        const last = b.at(-1);

        if (last !== undefined && last[1] >= begin - 1) {
            last[1] = Math.max(last[1], end);
        } else {
            b.push([begin, end]);
        }
    }

    return b;
}

export function main(): void {
    const isTest = Deno.args[0].match(/test/i) !== null;
    const line = isTest ? 10 : 2_000_000;
    const input = loadInput();
    let overlaps: Overlap[] = [];

    input.forEach(([sensor, beacon]) => {
        const radius = dist(sensor, beacon);
        const overlap = overlapAtY(sensor, radius, line);

        if (overlap !== null) overlaps.push(overlap);
    });

    overlaps = overlapsUnion(overlaps);
    if (overlaps.length !== 1) throw `Expected a single overlapped area`;

    const [ol, or] = overlaps[0];

    // Remove any beacons that might have fallen into that overlap
    const removedXs: Set<number> = new Set();
    for (const [_, b] of input) {
        if (b[1] === line && b[0] >= ol && b[1] <= or) removedXs.add(b[0]);
    }

    console.log(or - ol + 1 - removedXs.size);
}
