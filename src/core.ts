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

export class MinHeap<T> {
    #data: T[] = [];

    constructor(
        public less: (a: T, b: T) => boolean,
        public onIndexUpdate: null | ((a: T, newIndex: number) => void) = null,
    ) {}

    private swap(i: number, j: number): void {
        [this.#data[i], this.#data[j]] = [this.#data[j], this.#data[i]];
        if (this.onIndexUpdate !== null) {
            this.onIndexUpdate(this.#data[i], i);
            this.onIndexUpdate(this.#data[j], j);
        }
    }

    private normalizeIndex(i: number): number {
        if (i < 0) i = this.length - i;
        if (i < 0 || i >= this.length) throw `Index out of range: ${i}`;
        return i;
    }

    get length(): number {
        return this.#data.length;
    }

    peek(index = 0): T {
        return this.#data[this.normalizeIndex(index)];
    }

    siftDown(index = 0) {
        let didSwap = false;
        index = this.normalizeIndex(index);

        do {
            let smallest = index;
            const left = 2 * index + 1;
            const right = left + 1;

            // Find the smallest element
            if (left < this.length && this.less(this.#data[left], this.#data[smallest])) {
                smallest = left;
            }
            if (right < this.length && this.less(this.#data[right], this.#data[smallest])) {
                smallest = right;
            }

            // Make smallest the root and continue looping if swap was needed
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
                didSwap = true;
            } else {
                didSwap = false;
            }
        } while (didSwap);
    }

    siftUp(index = 0) {
        index = this.normalizeIndex(index);
        let parent = ((index - 1) / 2) >> 0; // integer division

        // Swap element with its parent while it's smaller
        while (index > 0 && this.less(this.#data[index], this.#data[parent])) {
            this.swap(index, parent);

            // Continue looping at the higher level
            index = parent;
            parent = ((index - 1) / 2) >> 0; // integer division
        }
    }

    push(item: T) {
        this.#data.push(item);
        if (this.onIndexUpdate !== null) this.onIndexUpdate(item, this.length - 1);
        this.siftUp(this.length - 1);
    }

    pop(index = 0): T {
        index = this.normalizeIndex(index);
        const popped = this.#data[index];

        if (this.length - 1 !== index) {
            // Replace with last, then sift the swapped item back into place
            this.swap(index, this.length - 1);
            this.#data.pop();
            this.siftDown(index);
        } else {
            // No need to do anything if last element was removed
            this.#data.pop();
        }

        if (this.onIndexUpdate !== null) this.onIndexUpdate(popped, NaN);
        return popped;
    }
}

export function* zip<T, U, V = null>(
    a: Iterable<T>,
    b: Iterable<U>,
    fillValue: V,
): Generator<[T | V, U | V], void, void> {
    const x = a[Symbol.iterator]();
    const y = b[Symbol.iterator]();

    while (true) {
        const xElem = x.next();
        const yElem = y.next();

        if (xElem.done && yElem.done) break;
        yield [xElem.done ? fillValue : xElem.value, yElem.done ? fillValue : yElem.value];
    }
}

export class Bisection {
    static search<T>(x: readonly T[], lessThanTarget: (a: T) => boolean): number {
        let l = 0;
        let r = x.length;

        while (l < r) {
            const h = (l + r) >> 1;
            if (lessThanTarget(x[h])) {
                l = h + 1;
            } else {
                r = h;
            }
        }

        return l;
    }

    static has<T>(haystack: readonly T[], needle: T): boolean {
        return haystack.at(Bisection.search(haystack, (x) => x < needle)) === needle;
    }

    static insert<T>(haystack: T[], needle: T): void {
        const idx = Bisection.search(haystack, (x) => x < needle);
        if (haystack.at(idx) === needle) return;
        haystack.splice(idx, 0, needle);
    }
}

export function extractIntegers(x: string): number[] {
    return (x.match(/[0-9]+/g) ?? []).map((m) => parseInt(m, 10));
}
