import { linesFromFile } from "./core.ts";

enum Axis {
    X = 0,
    Y = 1,
    Z = 2,
}

export type Cube = [x: number, y: number, z: number];

export class Face {
    // NOTE: Faces are identified by their bottom-left corner
    constructor(public x: number, public y: number, public z: number, public axis: Axis) {}

    // NOTE: Coords are less than 30, so 6 bits are enough to encode each coordinate
    // NOTE: 2 bits are required to encode the axis
    encode(): number {
        return this.axis & 0b11 | (this.x & 0x3F) << 2 | (this.y & 0x3F) << 8 |
            (this.z & 0x3F) << 14;
    }

    static fromEncoded(a: number): Face {
        return new Face(
            (a >> 2) & 0x3F,
            (a >> 8) & 0x3F,
            (a >> 14) & 0x3F,
            a & 0b11,
        );
    }
}

export function facesOfCube(x: number, y: number, z: number): Face[] {
    // A face as identified by the bottom-left corner
    return [
        new Face(x, y, z, Axis.X),
        new Face(x, y, z, Axis.Y),
        new Face(x, y, z, Axis.Z),
        new Face(x, y, z + 1, Axis.X),
        new Face(x + 1, y, z, Axis.Y),
        new Face(x, y + 1, z, Axis.Z),
    ];
}

export function loadInput(): [x: number, y: number, z: number][] {
    return linesFromFile(Deno.args[0]).map((l) => {
        const parts = l.split(",");
        if (parts.length !== 3) throw `Invalid cube: ${l}`;
        return parts.map((x) => parseInt(x, 10)) as Cube;
    });
}

export function findFreeFaces(cubes: Cube[]): Set<number> {
    const free: Set<number> = new Set();
    const occupied: Set<number> = new Set();

    for (const cube of cubes) {
        for (const face of facesOfCube(...cube)) {
            const encoded = face.encode();

            if (occupied.has(encoded)) {
                // Face is already occupied - skip
            } else if (free.has(encoded)) {
                // Face was free, but becomes occupied
                free.delete(encoded);
                occupied.add(encoded);
            } else {
                // Face is free
                free.add(encoded);
            }
        }
    }

    return free;
}

export function main(): void {
    const cubes = loadInput();
    const freeFaces = findFreeFaces(cubes);
    console.log(freeFaces.size);
}
