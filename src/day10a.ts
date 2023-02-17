// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";

export class Processor {
    x = 1;
    cycle = 1;

    before_cycle_callback: null | ((p: Processor) => void) = null;
    after_cycle_callback: null | ((p: Processor) => void) = null;

    private startCycle(): void {
        if (this.before_cycle_callback !== null) this.before_cycle_callback(this);
    }

    private endCycle(): void {
        ++this.cycle;
        if (this.after_cycle_callback !== null) this.after_cycle_callback(this);
    }

    execute(instruction_row: string): void {
        const instruction = instruction_row.split(" ");
        switch (instruction[0]) {
            case "noop":
                this.startCycle();
                this.endCycle();
                break;

            case "addx": {
                const delta = parseInt(instruction[1], 10);

                // First cycle is empty
                this.startCycle();
                this.endCycle();

                // Second cycle actually adds
                this.startCycle();
                this.x += delta;
                this.endCycle();

                break;
            }
        }
    }
}

export function main(): void {
    let sum = 0;
    const cpu = new Processor();

    cpu.before_cycle_callback = (cpu) => {
        if (cpu.cycle % 40 === 20) sum += cpu.cycle * cpu.x;
    };

    for (const i of linesFromFile(Deno.args[0]))
        cpu.execute(i);

    console.log(sum);
}
