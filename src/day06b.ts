// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";

export function main(): void {
    const l = linesFromFile(Deno.args[0])[0];
    for (let i = 14; i <= l.length; ++i) {
        const window = l.slice(i - 14, i);
        if (window.length != 14) throw "bruh";

        const s = new Set(window);
        if (s.size === 14) {
            console.log(i);
            break;
        }
    }
}
