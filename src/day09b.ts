import { linesFromFile, pairwise } from "./core.ts";
import { calcTailMove, dirToDelta, hashPosition } from "./day09a.ts";

export function applyDeltaInPlace(pt: [number, number], [dx, dy]: [number, number]): void {
    pt[0] += dx;
    pt[1] += dy;
}

export function main(): void {
    const rope: [number, number][] = new Array(10);
    for (let i = 0; i < rope.length; ++i) rope[i] = [0, 0];

    const visitedByTail: Set<string> = new Set();
    visitedByTail.add(hashPosition(rope.at(-1)!));

    for (const l of linesFromFile(Deno.args[0])) {
        const [dir, stepsStr] = l.split(" ");
        const steps = parseInt(stepsStr, 10);
        const delta = dirToDelta(dir);

        for (let i = 0; i < steps; ++i) {
            // Move the head
            applyDeltaInPlace(rope[0], delta);

            // Apply step
            for (const [head, tail] of pairwise(rope)) {
                applyDeltaInPlace(tail, calcTailMove(head, tail));
            }

            // Update the set of visited nodes
            visitedByTail.add(hashPosition(rope.at(-1)!));
        }
    }

    console.log(visitedByTail.size);
}
