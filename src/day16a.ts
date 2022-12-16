import { Bisection, linesFromFile } from "./core.ts";

export type Valve = { flowRate: number; tunnels: string[] };
export type Valves = Map<string, Valve>;

export function loadValves(): Valves {
    const valves: Valves = new Map(
        linesFromFile(Deno.args[0]).map((line) => {
            const match = line.match(
                /^Valve ([A-Z]{2}) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/i,
            );
            if (match === null) throw `Invalid line: ${line}`;
            const [_, name, flowRateStr, tunnelsStr] = match;
            const flowRate = parseInt(flowRateStr, 10);
            const tunnels = tunnelsStr.split(", ");
            return [name, { flowRate: flowRate, tunnels: tunnels } as Valve];
        }),
    );
    return valves;
}

class Search {
    lookup: Map<string, number> = new Map();

    constructor(public valves: Valves) {}

    private hash(current: string, opened: readonly string[], timeLeft: number): string {
        return `${current}-${timeLeft}-${opened.join("+")}`;
    }

    do(current: string, opened: readonly string[], timeLeft: number): number {
        // Check if run out of time to open new valves
        if (timeLeft <= 0) return 0;

        // Check in cache
        const argsHash = this.hash(current, opened, timeLeft);
        const cached = this.lookup.get(argsHash);
        if (cached !== undefined) return cached;

        let best = 0;
        const data = this.valves.get(current)!;

        // Valve can be opened - recurse into all possible paths where valve was opened
        if (!Bisection.has(opened, current) && data.flowRate > 0) {
            const addedFlow = data.flowRate * (timeLeft - 1);

            const newOpened = [...opened]; // copy array
            Bisection.insert(newOpened, current);

            for (const adjacent of data.tunnels) {
                best = Math.max(best, addedFlow + this.do(adjacent, newOpened, timeLeft - 2));
            }
        }

        // Recurse into all possible path where valve was not opened
        for (const adjacent of data.tunnels) {
            best = Math.max(best, this.do(adjacent, opened, timeLeft - 1));
        }

        // Save result in cache
        this.lookup.set(argsHash, best);
        return best;
    }
}

export function main(): void {
    const search = new Search(loadValves());
    console.log(search.do("AA", [], 30));
}
