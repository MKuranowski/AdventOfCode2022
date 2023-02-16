import { loadBlueprints, maxGeodes } from "./day19a.ts";

export function main(): void {
    const blueprints = loadBlueprints();
    let prod = 1;
    for (const [id, b] of blueprints.slice(0, 3)) {
        console.log(`Blueprint ${id}`);
        prod *= maxGeodes(b, 32)
    }
    console.log(prod);
}
