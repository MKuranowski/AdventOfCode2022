import { State } from "./day23a.ts";

export function main(): void {
    const s = State.fromInput();
    let r = 1;
    while (s.move()) ++r;
    console.log(r);
}
