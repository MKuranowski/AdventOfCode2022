// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { enumerate, linesFromFile, splitOn, zip } from "./core.ts";

export type Packet = (Packet | number)[];

export function parsePacket(line: string): Packet {
    const packetStack: Packet[] = [];
    let num = "";

    for (const c of line) {
        switch (c) {
            case ",":
                if (num !== "") {
                    packetStack.at(-1)!.push(parseInt(num, 10));
                    num = "";
                }
                break;

            case "[":
                if (num !== "") throw "Missing comma";
                packetStack.push([]);
                break;

            case "]":
                if (num !== "") {
                    packetStack.at(-1)!.push(parseInt(num, 10));
                    num = "";
                }
                if (packetStack.length === 0) throw "Unbalanced packet";
                else if (packetStack.length === 1) return packetStack.pop()!;
                packetStack.at(-2)!.push(packetStack.pop()!);
                break;

            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                num += c;
                break;

            default:
                throw `Unknown character in packet: ${c}`;
        }
    }

    throw "Unbalanced packet";
}

export function parsePacketPair(lines: string[]): [Packet, Packet] {
    if (lines.length !== 2) throw `Pair can't consist of ${lines.length} items`;
    return [parsePacket(lines[0]), parsePacket(lines[1])];
}

function coerceToPacket(x: Packet | number): Packet {
    return x instanceof Array ? x : [x];
}

function cmpNumber(a: number, b: number): number {
    if (a < b) return -1;
    else if (a > b) return 1;
    return 0;
}

export function cmpPacket(a: Packet, b: Packet): number {
    for (const [left, right] of zip(a, b, null)) {
        // End-of-packet comparisons
        if (left === null) return -1;
        if (right === null) return 1;

        let cmpResult = 0;
        if (left instanceof Array || right instanceof Array) {
            cmpResult = cmpPacket(coerceToPacket(left), coerceToPacket(right));
        } else {
            cmpResult = cmpNumber(left, right);
        }

        if (cmpResult !== 0) return cmpResult;
    }

    return 0;
}

export function main(): void {
    const rawPairs = splitOn(linesFromFile(Deno.args[0]), (l) => l === "");
    const pairs = rawPairs.map((p) => parsePacketPair(p));

    let sum = 0;
    for (const [idx, pair] of enumerate(pairs, 1)) {
        const i = cmpPacket(...pair);
        if (i === 0) throw "equal elements - undefined behavior";
        if (i < 0) sum += idx;
    }
    console.log(sum);
}
