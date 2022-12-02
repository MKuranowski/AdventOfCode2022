import { mod } from "./core.ts";
import { loadPairs } from "./day02a.ts";

function scoreForResult(opponent: number, expectedResult: number): number {
    switch (expectedResult) {
        case 0: // X - lose - must play `opponent - 1`
            return mod(opponent - 1, 3) + 1;

        case 1: // Y - draw - must play `opponent`
            return 3 + opponent + 1;

        case 2: // Z - win - must play `opponent + 1`
            return 6 + mod(opponent + 1, 3) + 1;

        default:
            throw `Invalid expectedResult: ${expectedResult}`;
    }
}

export function main(): void {
    const pairs = loadPairs();
    const scores = pairs.map(([elf, expectedResult]) => scoreForResult(elf, expectedResult));
    const sum = scores.reduce((a, b) => a + b);
    console.log(sum);
}
