// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { readAllSync } from "https://deno.land/std@0.168.0/streams/read_all.ts";

type Valve = { flowRate: number; tunnels: number[] };
type Valves = Map<number, Valve>;
type DenseValve = { flowRate: number; to: Map<number, number> };
type DenseValves = Map<number, DenseValve>;

const encoder = new TextEncoder();

class ValveNameConverter {
    m: Map<string, number> = new Map([["AA", 0]]);
    c = 1;

    convert(name: string): number {
        let number = this.m.get(name);
        if (number === undefined) {
            number = this.c++;
            this.m.set(name, number);
        }
        return number;
    }
}

function loadValves(): Valves {
    // Read stdin and remove trailing newline
    const lines = new TextDecoder().decode(readAllSync(Deno.stdin)).split("\n");
    if (lines.at(-1) === "") lines.splice(-1, 1);

    // Convert valve names to numbers - for easier hashing
    const nameConverter = new ValveNameConverter();

    const valves: Valves = new Map(
        lines.map((line) => {
            const match = line.match(
                /^Valve ([A-Z]{2}) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/i,
            );
            if (match === null) throw `Invalid line: ${line}`;
            const [_, name, flowRateStr, tunnelsStr] = match;
            const flowRate = parseInt(flowRateStr, 10);
            const number = nameConverter.convert(name);
            const tunnels = tunnelsStr.split(", ").map(nameConverter.convert.bind(nameConverter));
            return [number, { flowRate: flowRate, tunnels: tunnels } as Valve];
        }),
    );

    // Assert we have less than 64 nodes
    if (nameConverter.c >= 64) throw `Too many nodes: ${nameConverter.c}`;

    return valves;
}

function compressGraph(sparseValves: Valves): DenseValves {
    // Floyd-Warshall algorithm to find shortest paths between nodes
    const n = sparseValves.size;

    // Initialize distances
    const valves: DenseValves = new Map();
    for (const [id, v] of sparseValves) {
        valves.set(id, { flowRate: v.flowRate, to: new Map(v.tunnels.map((n) => [n, 1])) });
    }

    const dist = (a: number, b: number): number => valves.get(a)!.to.get(b) ?? Infinity;
    const setDist = (a: number, b: number, dist: number) => valves.get(a)!.to.set(b, dist);

    // Relax edges
    for (let k = 0; k < n; ++k) {
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                setDist(i, j, Math.min(dist(i, j), dist(i, k) + dist(k, j)));
            }
        }
    }

    // Remove valves without any flowRate
    for (const [id, v] of valves) {
        if (v.flowRate === 0 && id !== 0) {
            // Completely remove valves without any flow, except for the starting node
            valves.delete(id);
        } else {
            // Remove any neighbors that have no flow and disallow moving to the same node
            for (const n of v.to.keys()) {
                if (n === id || sparseValves.get(n)!.flowRate === 0) v.to.delete(n);
            }
        }
    }

    return valves;
}

// Read the sparse graph
const s = loadValves();

// Compress the graph
const g = compressGraph(s);

// Dump it onto stdout
for (const [from, { flowRate, to }] of g) {
    const toStr = [...to].map(([toName, cost]) => `${toName}-${cost}`).sort().join(",");
    Deno.stdout.writeSync(encoder.encode(`${from}:${flowRate}:${toStr}\n`));
}
