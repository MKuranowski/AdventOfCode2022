// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile, setIntersection } from "./core.ts";
import { charToPriority } from "./day03a.ts";

type Rucksack = Set<string>;

function loadInput(): [Rucksack, Rucksack, Rucksack][] {
    const groups: [Rucksack, Rucksack, Rucksack][] = [];
    const lines = linesFromFile(Deno.args[0]);
    for (let i = 0; i < lines.length; i += 3) {
        groups.push([new Set(lines[i]), new Set(lines[i + 1]), new Set(lines[i + 2])]);
    }
    return groups;
}

function commonPriority(r: [Rucksack, Rucksack, Rucksack]): number {
    let s = 0;
    setIntersection(...r).forEach((item) => s += charToPriority(item));
    return s;
}

export function main(): void {
    console.log(loadInput().map(commonPriority).reduce((a, b) => a + b));
}
