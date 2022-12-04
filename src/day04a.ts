import { linesFromFile } from "./core.ts";

export class Range {
    constructor(public start: number, public end: number) {
        if (end < start) throw `Invalid Range: from ${start} to ${end}`;
    }

    static fromString(x: string, sep = "-"): Range {
        const [startStr, endStr] = x.split(sep);
        return new Range(parseInt(startStr, 10), parseInt(endStr, 10));
    }

    public contains(other: Range): boolean {
        return other.start >= this.start && other.end <= this.end;
    }

    public overlaps(other: Range): boolean {
        return !(other.end < this.start || other.start > this.end);
    }
}

export function loadRangePairs(): [Range, Range][] {
    const pairs: [Range, Range][] = [];
    for (const line of linesFromFile(Deno.args[0])) {
        const [a, b] = line.split(",");
        pairs.push([Range.fromString(a), Range.fromString(b)]);
    }
    return pairs;
}

export function main(): void {
    console.log(loadRangePairs().filter(([a, b]) => a.contains(b) || b.contains(a)).length);
}
