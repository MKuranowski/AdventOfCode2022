// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";
import { Processor } from "./day10a.ts";

export class CRT {
    picture: string[][];

    constructor() {
        this.picture = [];
        for (let i = 0; i < 6; ++i) this.picture.push(new Array(40).fill("."));
    }

    print() {
        console.log(this.picture.map(row => row.join("")).join("\n"));
    }

    processor_cb(cpu: Processor): void {
        const pixelIdx = (cpu.cycle - 1) % 240;
        const row = (pixelIdx / 40) >> 0;  // integer division
        const col = pixelIdx % 40;

        if (col === cpu.x || col - 1 === cpu.x || col + 1 === cpu.x)
            this.picture[row][col] = "#";
    }
}


export function main(): void {
    const cpu = new Processor();
    const crt = new CRT();

    cpu.before_cycle_callback = crt.processor_cb.bind(crt);

    for (const i of linesFromFile(Deno.args[0]))
        cpu.execute(i);

    crt.print();
}
