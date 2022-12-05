import { Crate, Move, loadInput, readTops } from "./day05a.ts";

export function performMoves(crates: Crate[], moves: Move[]) {
    for (const move of moves)
        crates[move.to].push(...crates[move.from].splice(-move.count));
}

export function main(): void {
    const [crates, moves] = loadInput();
    performMoves(crates, moves);
    console.log(readTops(crates));
}
