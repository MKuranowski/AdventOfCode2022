import { linesFromFile } from "./core.ts";

export function elementToNumber(x: string): number {
    switch (x) {
        case "A":
        case "X":
            return 0;
        case "B":
        case "Y":
            return 1;
        case "C":
        case "Z":
            return 2;
        default:
            throw `Invalid element: ${x}`;
    }
}

export function loadPairs(): [number, number][] {
    const pairs: [number, number][] = [];
    for (const line of linesFromFile(Deno.args[0])) {
        const [elf, me] = line.split(" ");
        pairs.push([elementToNumber(elf), elementToNumber(me)]);
    }
    return pairs;
}

export function wins(me: number, opponent: number) {
    return me === (opponent + 1) % 3;
}

export function score(elf: number, me: number): number {
    if (wins(me, elf)) {
        return 6 + me + 1;
    } else if (me === elf) {
        return 3 + me + 1;
    } else {
        return me + 1;
    }
}

export function main(): void {
    const pairs = loadPairs();
    const scores = pairs.map(([elf, me]) => score(elf, me));
    const sum = scores.reduce((a, b) => a + b)
    console.log(sum);
}
