import { Cave } from "./day17a.ts";

const MaxRepeatPeriod = 2500;
const MinCycleLength = 10;

function arrEq<T>(a: readonly T[], b: readonly T[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function findCycle(deltas: number[]): { cycleLength: number; cycleOffset: number } {
    // Try every possible offset into the deltas, as
    // the cycle most likely won't start at the very beginning.
    for (let offset = 0; offset < MaxRepeatPeriod; ++offset) {
        // Try different lengths of the cycle, avoid super short cycles
        for (let length = MinCycleLength; length < MaxRepeatPeriod; ++length) {
            // Compare the first instance of the candidate "cycle"
            // with the second instance of a possible "cycle"
            const l = deltas.slice(offset, offset + length);
            const r = deltas.slice(offset + length, offset + 2 * length);

            // First and second instances match - consider this a successful find
            if (arrEq(l, r)) {
                return { cycleLength: length, cycleOffset: offset };
            }
        }
    }

    throw "No cycle :(";
}

function calculateHeight(
    iterations: number,
    deltas: number[],
    cycleLength: number,
    cycleOffset: number,
): number {
    let h = 0;

    // Add the initial offset
    for (let i = 0; i < cycleOffset; ++i) {
        h += deltas[i];
    }
    iterations -= cycleOffset;

    // Apply the cycle
    const cycle = deltas.slice(cycleOffset, cycleOffset + cycleLength);
    const totalCycleHeightDelta = cycle.reduce((a, b) => a + b);
    const fullCyclesToAdd = Math.floor(iterations / cycleLength);
    h += totalCycleHeightDelta * fullCyclesToAdd;

    // Add the last offsets,
    const leftover = (iterations % cycleLength);
    for (let i = 0; i < leftover; ++i) {
        h += cycle[i];
    }

    return h;
}

export function main(): void {
    // Because this is Advent of Code, obviously we wouldn't run the simulation for 10^12
    // blocks.
    //
    // My first idea was to see if get rows that are completely filled,
    // which can be then treated as the next floor.
    //
    // Then I wanted to see if the new floor would somehow "happen" precisely on when
    // jet directions and shapes repeat - but this didn't work at all.
    //
    // So I have decided to do a brute-force search for a repeating pattern.

    // 1. Simulate 2*MaxRepeatPeriod blocks falling,
    //    while keeping track of the differences in heights.
    const heightDeltas: number[] = [];
    let prevHeight = 0;
    const c = new Cave();
    for (let i = 0; i < 2 * MaxRepeatPeriod; ++i) {
        c.dropBlock();
        heightDeltas.push(c.height - prevHeight);
        prevHeight = c.height;
    }

    // 2. Brute-force find the cycle
    const { cycleLength, cycleOffset } = findCycle(heightDeltas);

    // 3. Calculate the height from the cycle
    console.log(calculateHeight(1_000_000_000_000, heightDeltas, cycleLength, cycleOffset));
}
