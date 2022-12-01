export function linesFromFile(path: string): string[] {
    return Deno.readTextFileSync(path).split("\n");
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
