import { Mazes, dijkstraSearch, SearchState } from "./day24a.ts";

export function main(): void {
    const m = Mazes.fromInput();

    const s1 = dijkstraSearch(m, new SearchState(1, 0, 0), [m.rightWall - 1, m.bottomWall]);
    const s2 = dijkstraSearch(m, s1, [1, 0]);
    const s3 = dijkstraSearch(m, s2, [m.rightWall - 1, m.bottomWall]);

    console.log(s3.t);
}
