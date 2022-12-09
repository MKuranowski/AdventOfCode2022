import { linesFromFile } from "./core.ts";

export function hashPosition([x, y]: [number, number]): string {
    return `${x}-${y}`;
}

export function applyDelta(
    [x, y]: [number, number],
    [dx, dy]: [number, number],
): [number, number] {
    return [x + dx, y + dy];
}

export function dirToDelta(dir: string): [number, number] {
    switch (dir) {
        case "R":
            return [1, 0];
        case "L":
            return [-1, 0];
        case "U":
            return [0, 1];
        case "D":
            return [0, -1];
        default:
            throw `Invalid direction: ${dir}`;
    }
}

export function calcTailMove(
    [hx, hy]: [number, number],
    [tx, ty]: [number, number],
): [number, number] {
    const dx = hx - tx;
    const dy = hy - ty;

    // Tail and head are touching
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return [0, 0];

    return [Math.sign(dx), Math.sign(dy)];
}

export function main(): void {
    let head: [number, number] = [0, 0];
    let tail: [number, number] = [0, 0];

    const visitedByTail: Set<string> = new Set();
    visitedByTail.add(hashPosition(tail));

    for (const l of linesFromFile(Deno.args[0])) {
        const [dir, stepsStr] = l.split(" ");
        const steps = parseInt(stepsStr, 10);
        const delta = dirToDelta(dir);

        for (let i = 0; i < steps; ++i) {
            // Apply step
            head = applyDelta(head, delta);
            tail = applyDelta(tail, calcTailMove(head, tail));

            // Update the set of visited nodes
            visitedByTail.add(hashPosition(tail));
        }
    }

    console.log(visitedByTail.size);
}
