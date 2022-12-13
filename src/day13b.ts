import { enumerate, linesFromFile } from "./core.ts";
import { parsePacket, cmpPacket } from "./day13a.ts";

export function main(): void {
    const rawPairs = linesFromFile(Deno.args[0]).filter(l => l !== "");
    const pairs = rawPairs.map((p) => parsePacket(p));
    pairs.push([[2]], [[6]]);
    pairs.sort(cmpPacket);

    let result = 1;
    for (const [idx, packet] of enumerate(pairs, 1)) {
        if (cmpPacket(packet, [[2]]) === 0 || cmpPacket(packet, [[6]]) === 0)
            result *= idx;
    }
    console.log(result);
}
