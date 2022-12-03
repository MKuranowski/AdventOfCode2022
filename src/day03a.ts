import { linesFromFile, setIntersection } from "./core.ts";

type Rucksack = [Set<string>, Set<string>];

export function charToPriority(char: string): number {
    const charCode = char.charCodeAt(0);
    if (charCode >= 65 && charCode <= 90) {
        return charCode - 38;
    } else if (charCode >= 97 && charCode <= 122) {
        return charCode - 96;
    } else {
        throw `Unexpected charCode: ${charCode} (${String.fromCharCode(charCode)})`;
    }
}

function loadInput(): Rucksack[] {
    return linesFromFile(Deno.args[0])
        .map((line) => [
            new Set(line.slice(0, line.length / 2)),
            new Set(line.slice(line.length / 2)),
        ]);
}

function commonPriority(r: Rucksack): number {
    let s = 0;
    setIntersection(...r).forEach((item) => s += charToPriority(item));
    return s;
}

export function main(): void {
    console.log(loadInput().map(commonPriority).reduce((a, b) => a + b));
}
