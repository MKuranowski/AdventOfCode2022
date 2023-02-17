// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";
import { Simulation } from "./day14a.ts";

export function main(): void {
    const sim = new Simulation();
    linesFromFile(Deno.args[0]).forEach(l => sim.addRocksFromLine(l));

    while (!sim.finished) sim.dropSandPartB();
    console.log(sim.sand.size);
}
