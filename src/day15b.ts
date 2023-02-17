import { dist, Overlap, overlapAtY, overlapsUnion, loadInput } from "./day15a.ts";

export function main(): void {
    const isTest = Deno.args[0].match(/test/i) !== null;
    const bound = isTest ? 20 : 4_000_000;
    const input = loadInput();

    for (let y = 0; y < bound; ++y) {
        let overlaps: Overlap[] = [];

        input.forEach(([sensor, beacon]) => {
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
