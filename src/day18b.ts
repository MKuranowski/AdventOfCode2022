// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { Cube, findFreeFaces, loadInput } from "./day18a.ts";

function encodeCube(x: number, y: number, z: number): number {
    return (x & 0x3F) | (y & 0x3F) << 6 | (z & 0x3F) << 12;
}

function* allCubes(): Generator<Cube, void, void> {
    for (let x = 0; x < 64; ++x) {
        for (let y = 0; y < 64; ++y) {
            for (let z = 0; z < 64; ++z) {
                yield [x, y, z];
            }
        }
    }
}

function* neighborsOfCube(x: number, y: number, z: number): Generator<Cube, void, void> {
    if (x > 0) yield [x - 1, y, z];
    if (x < 31) yield [x + 1, y, z];
    if (y > 0) yield [x, y + 1, z];
    if (y < 31) yield [x, y - 1, z];
    if (z > 0) yield [x, y, z + 1];
    if (z < 31) yield [x, y, z - 1];
}

function isTrapped(c: Cube, cubes: Set<number>): boolean {
    if (cubes.has(encodeCube(...c))) return true;

    // Consider as trapped if it's impossible to visit
    // an axis at -1 or 64.

    const q = [c];
    const visited: Set<number> = new Set([encodeCube(...c)]);

    while (q.length > 0) {
        const popped = q.pop()!;
        if (popped.find(axis => axis < 0 || axis > 63) !== undefined) return false;

        for (const neighbor of neighborsOfCube(...popped)) {
            const neighborEncoded = encodeCube(...neighbor);
            if (!cubes.has(neighborEncoded) && !visited.has(neighborEncoded)) {
                q.push(neighbor);
                visited.add(neighborEncoded);
            }
        }
    }

    return true;
}

function* findTrapped(cubes: Set<number>): Generator<Cube, void, void> {
    for (const cube of allCubes()) {
        if (isTrapped(cube, cubes)) yield cube;
    }
}


export function main(): void {
    const droplets = loadInput();
    const dropletsSet = new Set(droplets.map((c) => encodeCube(...c)));
    const cubes = [...findTrapped(dropletsSet)];
    const freeFaces = findFreeFaces(cubes);
    console.log(freeFaces.size);
}
