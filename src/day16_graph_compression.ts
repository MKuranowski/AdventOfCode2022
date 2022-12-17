import { readAllSync } from "https://deno.land/std@0.168.0/streams/read_all.ts";
import { MinHeap } from "./core.ts";

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

function compressGraph(v: Valves): DenseValves {
    const g: DenseValves = new Map();

    for (const [from, valve] of v) {
        // Ignore pointless valves
        if (valve.flowRate === 0 && from !== 0) continue;

        const distances: Map<number, number> = new Map();

        // undefined - not visited, NaN - already visited
        const entries: Map<number, number> = new Map();

        const q = new MinHeap<number>(
            (a, b) => (distances.get(a) ?? Infinity) < (distances.get(b) ?? Infinity),
            (to, newIndex) => entries.set(to, newIndex),
        );

        // Start by pushing the entry node
        distances.set(from, 0);
        q.push(from);

        // Run Dijkstra to calculate path lengths between valves
        while (q.length > 0) {
            const popped = q.pop();
            const altCost = distances.get(popped)! + 1;

            // Add outgoing edges
            for (const to of v.get(popped)!.tunnels) {
                // See if altCost is better
                if (altCost < (distances.get(to) ?? Infinity)) {
                    distances.set(to, altCost);

                    // See if `to` was already in the queue
                    const existingIdx = entries.get(to);

                    if (existingIdx === undefined) {
                        // Was not in the queue
                        q.push(to);
                    } else if (isNaN(existingIdx)) {
                        // Was already visited, but we have a cheaper way?
                        throw "Dijkstra broke";
                    } else {
                        q.siftDown(existingIdx);
                    }
                }
            }
        }

        // Remove pointless paths
        for (const [to, { flowRate }] of v) {
            if (flowRate === 0) distances.delete(to);
        }
        distances.delete(from);

        // Remember them distances
        g.set(from, { flowRate: valve.flowRate, to: distances });
    }

    return g;
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
