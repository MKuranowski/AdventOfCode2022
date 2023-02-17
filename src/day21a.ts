// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";

export type Operation = {
    a: string;
    b: string;
    op: string;
};

export type Node = Operation | number;

export class Calculator {
    cache: Map<string, number> = new Map();

    constructor(public data: Map<string, Node>) {}

    valueFor(monkey: string): number {
        const cached = this.cache.get(monkey);
        if (cached !== undefined) return cached;

        const nd = this.data.get(monkey)!;
        let result: number;

        if (typeof nd === "number") {
            result = nd;
        } else {
            switch (nd.op) {
                case "+":
                    result = this.valueFor(nd.a) + this.valueFor(nd.b);
                    break;

                case "-":
                    result = this.valueFor(nd.a) - this.valueFor(nd.b);
                    break;

                case "*":
                    result = this.valueFor(nd.a) * this.valueFor(nd.b);
                    break;

                case "/":
                    result = this.valueFor(nd.a) / this.valueFor(nd.b);
                    break;

                case "=":
                    result = this.valueFor(nd.a) === this.valueFor(nd.b) ? 1 : 0;
                    break;

                default:
                    throw `Invalid op: ${nd.op}`;
            }
        }

        this.cache.set(monkey, result);
        return result;
    }
}

export function loadInput(): Map<string, Node> {
    const data: Map<string, Node> = new Map();
    for (const line of linesFromFile(Deno.args[0])) {
        const opMatch = line.match(/^(\w{4}): (\w{4}) (\+|-|\*|\/) (\w{4})$/);
        const numMatch = line.match(/^(\w{4}): (\d+)$/);

        if (opMatch !== null) {
            data.set(opMatch[1], { a: opMatch[2], b: opMatch[4], op: opMatch[3] });
        } else if (numMatch !== null) {
            data.set(numMatch[1], parseInt(numMatch[2], 10));
        } else {
            throw `Unrecognized line: ${line}`;
        }
    }
    return data;
}

export function main(): void {
    console.log(new Calculator(loadInput()).valueFor("root"));
}
