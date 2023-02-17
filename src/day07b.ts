// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { loadInput } from "./day07a.ts";

export function main(): void {
    const root = loadInput();
    const toFree = 30_000_000 - 70_000_000 + root.totalSize;
    let minDirSizeToFree = Number.POSITIVE_INFINITY;
    root.walk(d => {
        if (d.totalSize >= toFree && d.totalSize < minDirSizeToFree)
            minDirSizeToFree = d.totalSize;
    });
    console.log(minDirSizeToFree);
}
