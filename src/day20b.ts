// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";
import { State } from "./day20a.ts";

export function main(): void {
    const numbers = linesFromFile(Deno.args[0]).map((l) => parseInt(l, 10) * 811589153);
    const newNumbers = State.runOn(numbers, 10);

    const zeroIdx = newNumbers.indexOf(0);
    const a = newNumbers[(zeroIdx + 1000) % newNumbers.length];
    const b = newNumbers[(zeroIdx + 2000) % newNumbers.length];
    const c = newNumbers[(zeroIdx + 3000) % newNumbers.length];

    console.log(a + b + c);
}
