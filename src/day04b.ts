// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { loadRangePairs } from "./day04a.ts";

export function main(): void {
    console.log(loadRangePairs().filter(([a, b]) => a.overlaps(b)).length);
}
