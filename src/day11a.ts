import { linesFromFile, splitOn } from "./core.ts";

export type Monkey = {
    idx: number;
    items: number[];
    op: (n: number) => number;
    divisibilityTest: number;
    ifTrueTarget: number;
    ifFalseTarget: number;
    inspections: number;
};

export function parseOp(op: string): (n: number) => number {
    if (op === "old * old") return (n) => n * n;

    const [_, sign, constantStr] = op.match(/^old (\+|\*) (\d+)/i)!;
    const constant = parseInt(constantStr, 10);

    if (sign === "*") {
        return (n) => n * constant;
    } else {
        return (n) => n + constant;
    }
}

export function parseMonkey(lines: string[]): Monkey {
    // First line
    const [_0, idxStr] = lines[0].match(/Monkey (\d+):/i)!;
    const idx = parseInt(idxStr, 10);

    // Second line
    const [_1, itemsStr] = lines[1].match(/Starting items: ([\d\s,]+)/i)!;
    const items = itemsStr.split(", ").map((v) => parseInt(v, 10));

    // Third line
    const [_2, opStr] = lines[2].match(/Operation: new = (.+)$/i)!;
    const op = parseOp(opStr);

    // Fourth line
    const [_3, divByStr] = lines[3].match(/Test: divisible by (\d+)/i)!;
    const divBy = parseInt(divByStr);

    // Fifth line
    const [_4, ifTrueToTargetStr] = lines[4].match(/If true: throw to monkey (\d+)/i)!;
    const ifTrueTarget = parseInt(ifTrueToTargetStr, 10);

    // Sixth line
    const [_5, ifFalseTargetStr] = lines[5].match(/If false: throw to monkey (\d+)/i)!;
    const ifFalseTarget = parseInt(ifFalseTargetStr, 10);

    return {
        idx: idx,
        items: items,
        op: op,
        divisibilityTest: divBy,
        ifTrueTarget: ifTrueTarget,
        ifFalseTarget: ifFalseTarget,
        inspections: 0,
    };
}

export function simulate(
    monkeys: Monkey[],
    rounds: number,
    worryDecreaser: (n: number) => number,
): void {
    // Rounds
    for (let round = 0; round < rounds; ++round) {
        // Turns
        for (const monkey of monkeys) {
            // Iterate over every item
            // NOTE: Monkeys don't throw items to itself, no need to pop
            for (let item of monkey.items) {
                // 1. Monkey start playing with the item - worry level increases
                item = monkey.op(item);

                // 2. Monkey stops playing - worry level decreases
                item = worryDecreaser(item);

                // 3. Perform the test and throw to next monkey
                if (item % monkey.divisibilityTest === 0) {
                    monkeys[monkey.ifTrueTarget].items.push(item);
                } else {
                    monkeys[monkey.ifFalseTarget].items.push(item);
                }

                // 4. Increase the inspection counter
                ++monkey.inspections;
            }

            // Clear monkeys items, as they all have been thrown
            monkey.items.length = 0;
        }
    }
}

export function monkeyBusiness(monkeys: Monkey[]): number {
    monkeys.sort((a, b) => b.inspections - a.inspections);
    return monkeys[0].inspections * monkeys[1].inspections;
}

export function main(): void {
    const input = splitOn(linesFromFile(Deno.args[0]), (x) => x === "");
    const monkeys = input.map(parseMonkey);
    simulate(
        monkeys,
        20,
        (n) => (n / 3) >> 0, // integer division
    );
    console.log(monkeyBusiness(monkeys));
}
