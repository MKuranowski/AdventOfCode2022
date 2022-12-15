import { dist, INPUT, Overlap, overlapAtY, overlapsUnion, TEST } from "./day15a.ts";

const BOUND = TEST ? 20 : 4000000;

export function main(): void {
    for (let y = 0; y < BOUND; ++y) {
        let overlaps: Overlap[] = [];

        INPUT.forEach(([sensor, beacon]) => {
            const radius = dist(sensor, beacon);
            const overlap = overlapAtY(sensor, radius, y);
            if (overlap !== null) overlaps.push(overlap);
        });

        // Collapse overlaps
        overlaps = overlapsUnion(overlaps);

        if (overlaps.length === 2) {
            const x = overlaps[0][1] + 1;
            console.log(x * 4000000 + y);
            return;
        } else if (overlaps.length !== 1) {
            throw `Unexpected overlaps at ${y}: ${overlaps}`;
        }
    }

    console.error("no solution :^(");
}
