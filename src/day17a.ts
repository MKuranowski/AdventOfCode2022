import { linesFromFile } from "./core.ts";

export type Coords = [number, number];

export const encode = (c: Coords): number => (c[1] << 3) | (c[0] & 0b111);
export const decode = (i: number): Coords => [i & 0b111, i >> 3];

export enum Shape {
    BAR,
    PLUS,
    L,
    PIPE,
    BOX,
}

// SHAPES: - X/x denote the coordinate of the shape
//
// BAR:
// X###
//
// PLUS:
// .#.
// ###
// x#.
//
// L:
// ..#
// ..#
// X##
//
// PIPE:
// #
// #
// #
// X
//
// BOX:
// ##
// X#

export function* cycleShapes(): Generator<Shape, void, void> {
    while (true) {
        yield Shape.BAR;
        yield Shape.PLUS;
        yield Shape.L;
        yield Shape.PIPE;
        yield Shape.BOX;
    }
}

export function* cycleWindDirections(): Generator<"<" | ">", void, void> {
    const l = linesFromFile(Deno.args[0])[0];

    while (true) {
        for (const c of l) {
            if (c === "<" || c === ">") yield c;
            else throw `Invalid wind direction: ${c}`;
        }
    }
}

export function occupiedPoints(s: Shape, pos: Coords): Coords[] {
    switch (s) {
        case Shape.BAR:
            return [pos, [pos[0] + 1, pos[1]], [pos[0] + 2, pos[1]], [pos[0] + 3, pos[1]]];
        case Shape.PLUS:
            return [
                [pos[0], pos[1] + 1],
                [pos[0] + 1, pos[1]],
                [pos[0] + 1, pos[1] + 1],
                [pos[0] + 1, pos[1] + 2],
                [pos[0] + 2, pos[1] + 1],
            ];
        case Shape.L:
            return [
                [pos[0], pos[1]],
                [pos[0] + 1, pos[1]],
                [pos[0] + 2, pos[1]],
                [pos[0] + 2, pos[1] + 1],
                [pos[0] + 2, pos[1] + 2],
            ];
        case Shape.PIPE:
            return [pos, [pos[0], pos[1] + 1], [pos[0], pos[1] + 2], [pos[0], pos[1] + 3]];
        case Shape.BOX:
            return [pos, [pos[0], pos[1] + 1], [pos[0] + 1, pos[1]], [pos[0] + 1, pos[1] + 1]];
    }
}

export class Cave {
    occupied: Set<number> = new Set();
    height = 0;

    shapes = cycleShapes();
    windDirections = cycleWindDirections();

    getStartPos(_s: Shape): Coords {
        return [2, this.height + 4];
    }

    intersects(s: Shape, pos: Coords): boolean {
        // Check if any occupied block would intersect
        for (const pt of occupiedPoints(s, pos)) {
            // Would hit a wall
            if (pt[0] < 0 || pt[0] >= 7) return true;

            // Would hit the floor
            if (pt[1] <= 0) return true;

            // Would hit an existing block
            if (this.occupied.has(encode(pt))) return true;
        }

        return false;
    }

    nextShape(): Shape {
        const r = this.shapes.next();
        if (r.done) throw "infinite iterator was finite";
        return r.value;
    }

    nextWindDirection(): "<" | ">" {
        const r = this.windDirections.next();
        if (r.done) throw "infinite iterator was finite";
        return r.value;
    }

    dropBlock(): void {
        const shape = this.nextShape();

        let pos = this.getStartPos(shape);

        // Loop until hit the floor
        while (true) {
            const windDirection = this.nextWindDirection();

            // Apply wind
            if (windDirection === "<" && !this.intersects(shape, [pos[0] - 1, pos[1]])) {
                pos = [pos[0] - 1, pos[1]];
            } else if (
                windDirection === ">" && !this.intersects(shape, [pos[0] + 1, pos[1]])
            ) {
                pos = [pos[0] + 1, pos[1]];
            }

            // Try to fall down
            if (this.intersects(shape, [pos[0], pos[1] - 1])) {
                break;
            } else {
                pos = [pos[0], pos[1] - 1];
            }
        }

        // Update the occupied blocks and height
        for (const pt of occupiedPoints(shape, pos)) {
            this.occupied.add(encode(pt));
            this.height = Math.max(this.height, pt[1]);
        }
    }

    draw(): void {
        for (let y = this.height; y > 0; --y) {
            for (let x = 0; x < 7; ++x) {
                if (this.occupied.has(encode([x, y]))) {
                    Deno.stdout.writeSync(new Uint8Array([0x23]));
                } else {
                    Deno.stdout.writeSync(new Uint8Array([0x2E]));
                }
            }
            Deno.stdout.writeSync(new Uint8Array([0xA]));
        }
    }
}

export function main(): void {
    const c = new Cave();
    for (let i = 0; i < 2022; ++i) {
        c.dropBlock();
    }
    console.log(c.height);
}
