export function linesFromFile(path: string): string[] {
    const lines = Deno.readTextFileSync(path).split("\n");
    if (lines.at(-1) === "") lines.pop(); // remove trailing newline
    return lines;
}

export function splitOn<T>(seq: Iterable<T>, pred: (_thing: T) => boolean): T[][] {
    const afterSplit: T[][] = [];
    let current: T[] = [];

    for (const elem of seq) {
        if (pred(elem)) {
            if (current.length > 0) afterSplit.push(current);
            current = [];
        } else {
            current.push(elem);
        }
    }

    if (current.length > 0) afterSplit.push(current);
    return afterSplit;
}

/**
 * Returns the Euclidian modulus of x.
 *
 * mod(13, 5) == 3 (== 13 % 5)
 * mod(-2, 5) == 3 (but -2 % 5 == -2)
 */
export function mod(x: number, modulus: number): number {
    return ((x % modulus) + modulus) % modulus;
}

/**
 * Returns an intersection of all the provided sets
 */
export function setIntersection<T>(a: Set<T>, ...others: Set<T>[]): Set<T> {
    const intersection: Set<T> = new Set();
    for (const elem of a) {
        let allHave = true;
        for (const other of others) {
            if (!other.has(elem)) {
                allHave = false;
                break;
            }
        }

        if (allHave) intersection.add(elem);
    }
    return intersection;
}

/**
 * Implementation of Python's enumerate.
 */
export function* enumerate<T>(it: Iterable<T>, start = 0): Iterable<[number, T]> {
    for (const i of it) yield [start++, i];
}

/**
 * Implementation pf Python's itertools.pairwise
 */
export function* pairwise<T>(it: Iterable<T>): Iterable<[T, T]> {
    let prev: T | null = null;
    for (const elem of it) {
        if (prev !== null) yield [prev, elem];
        prev = elem;
    }
}

export function gcd(a: number, b: number): number {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

export function lcm(a: number, b: number): number {
    return a * b / gcd(a, b);
}
