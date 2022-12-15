export type Overlap = [left: number, right: number];
export type Coords = [x: number, y: number];
export type Reading = [sensor: Coords, beacon: Coords];

export const TEST = false;

export const INPUT: Reading[] = TEST
    ? [
        [[2, 18], [-2, 15]],
        [[9, 16], [10, 16]],
        [[13, 2], [15, 3]],
        [[12, 14], [10, 16]],
        [[10, 20], [10, 16]],
        [[14, 17], [10, 16]],
        [[8, 7], [2, 10]],
        [[2, 0], [2, 10]],
        [[0, 11], [2, 10]],
        [[20, 14], [25, 17]],
        [[17, 20], [21, 22]],
        [[16, 7], [15, 3]],
        [[14, 3], [15, 3]],
        [[20, 1], [15, 3]],
    ]
    : [
        [[2832148, 322979], [3015667, -141020]],
        [[1449180, 3883502], [2656952, 4188971]],
        [[2808169, 1194666], [3015667, -141020]],
        [[1863363, 2435968], [2166084, 2883057]],
        [[3558230, 2190936], [3244164, 2592191]],
        [[711491, 2444705], [617239, 2988377]],
        [[2727148, 2766272], [2166084, 2883057]],
        [[2857938, 3988086], [2968511, 4098658]],
        [[1242410, 2270153], [214592, 2000000]],
        [[3171784, 2523127], [3244164, 2592191]],
        [[2293378, 71434], [3015667, -141020]],
        [[399711, 73420], [1152251, -158441]],
        [[3677529, 415283], [3015667, -141020]],
        [[207809, 2348497], [214592, 2000000]],
        [[60607, 3403420], [617239, 2988377]],
        [[3767729, 3136725], [4171278, 3348370]],
        [[3899632, 3998969], [4171278, 3348370]],
        [[394783, 1541278], [214592, 2000000]],
        [[1193642, 642631], [1152251, -158441]],
        [[122867, 2661904], [214592, 2000000]],
        [[551012, 3787568], [617239, 2988377]],
        [[3175715, 2975144], [3244164, 2592191]],
        [[402217, 2812449], [617239, 2988377]],
        [[879648, 1177329], [214592, 2000000]],
        [[1317218, 2978309], [617239, 2988377]],
        [[3965126, 1743931], [3244164, 2592191]],
        [[2304348, 3140055], [2166084, 2883057]],
        [[3380135, 3650709], [2968511, 4098658]],
        [[49224, 1914296], [214592, 2000000]],
        [[3096228, 2457233], [3244164, 2592191]],
        [[1415660, 6715], [1152251, -158441]],
        [[2616280, 3548378], [2656952, 4188971]],
    ];

export function dist([ax, ay]: Coords, [bx, by]: Coords): number {
    return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function overlapAtY([sx, sy]: Coords, radius: number, y: number): Overlap | null {
    const dy = Math.abs(sy - y);
    if (dy > radius) return null;

    const leftoverDistance = radius - dy;
    return [sx - leftoverDistance, sx + leftoverDistance];
}

export function overlapsUnion(a: Overlap[]): Overlap[] {
    // https://stackoverflow.com/a/15273749

    const b: Overlap[] = [];
    a.sort(([al, ar], [bl, br]) => al === bl ? ar - br : al - bl);

    for (const [begin, end] of a) {
        const last = b.at(-1);

        if (last !== undefined && last[1] >= begin - 1) {
            last[1] = Math.max(last[1], end);
        } else {
            b.push([begin, end]);
        }
    }

    return b;
}

export function main(): void {
    const line = TEST ? 10 : 2000000;
    let overlaps: Overlap[] = [];

    INPUT.forEach(([sensor, beacon]) => {
        const radius = dist(sensor, beacon);
        const overlap = overlapAtY(sensor, radius, line);

        if (overlap !== null) overlaps.push(overlap);
    });


    overlaps = overlapsUnion(overlaps);
    if (overlaps.length !== 1) throw "Expected a single overlapped area";

    const [ol, or] = overlaps[0];

    // Remove any beacons that might have fallen into that overlap
    const removedXs: Set<number> = new Set();
    for (const [_, b] of INPUT) {
        if (b[1] === line && b[0] >= ol && b[1] <= or) removedXs.add(b[0]);
    }

    console.log(or - ol + 1 - removedXs.size);
}
