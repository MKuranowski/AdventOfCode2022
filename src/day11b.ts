import { lcm, linesFromFile, splitOn } from "./core.ts";
import { monkeyBusiness, parseMonkey, simulate } from "./day11a.ts";

export function main(): void {
    const input = splitOn(linesFromFile(Deno.args[0]), (x) => x === "");
    const monkeys = input.map(parseMonkey);

    // To prevent worry levels from shooting into infinity,
    // we keep them modulo LCM of all the divisibility tests.
    const worryLevelMod = monkeys.reduce((i, m) => lcm(i, m.divisibilityTest), 1);

    simulate(
        monkeys,
        10_000,
        (n) => n % worryLevelMod, // integer division
    );
    console.log(monkeyBusiness(monkeys));
}
