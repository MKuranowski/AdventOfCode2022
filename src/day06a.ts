import { linesFromFile } from "./core.ts";

export function main(): void {
    const l = linesFromFile(Deno.args[0])[0];
    for (let i = 4; i <= l.length; ++i) {
        const window = l.slice(i - 4, i);

        const s = new Set(window);
        if (s.size === 4) {
            console.log(i);
            break;
        }
    }
}
