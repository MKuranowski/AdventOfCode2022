// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { extractIntegers, linesFromFile, MinHeap } from "./core.ts";

export type Material = "ore" | "clay" | "obsidian" | "geode";
export type Materials = Record<Material, number>;

export type Blueprint = Record<Material, Materials>;

const allMaterials: readonly Material[] = ["ore", "clay", "obsidian", "geode"];

function loadBlueprint(line: string): [number, Blueprint] {
    const [
        blueprintId,
        oreRobotOreCost,
        clayRobotOreCost,
        obsidianRobotOreCost,
        obsidianRobotClayCost,
        geodeRobotOreCost,
        geodeRobotObsidianCost,
    ] = extractIntegers(line);

    return [
        blueprintId,
        {
            ore: { ore: oreRobotOreCost, clay: 0, obsidian: 0, geode: 0 },
            clay: { ore: clayRobotOreCost, clay: 0, obsidian: 0, geode: 0 },
            obsidian: {
                ore: obsidianRobotOreCost,
                clay: obsidianRobotClayCost,
                obsidian: 0,
                geode: 0,
            },
            geode: { ore: geodeRobotOreCost, clay: 0, obsidian: geodeRobotObsidianCost, geode: 0 },
        },
    ];
}

export function loadBlueprints(): [number, Blueprint][] {
    return linesFromFile(Deno.args[0]).map((l) => loadBlueprint(l));
}

type SearchState = {
    timeLeft: number;
    stored: Materials;
    robots: Materials;
    allowedToBuild: Record<Material, boolean>;
};

function materialsHash(m: Materials): string {
    return `${m.ore ?? 0}-${m.clay ?? 0}-${m.obsidian ?? 0}-${m.geode ?? 0}`;
}

function allowedToBuildHash(a: Record<Material, boolean>): string {
    return `${a.ore}-${a.clay}-${a.obsidian}-${a.geode}`;
}

function stateHash(s: SearchState): string {
    return `${s.timeLeft}:${materialsHash(s.stored)}:${materialsHash(s.robots)}:${
        allowedToBuildHash(s.allowedToBuild)
    }`;
}

function maxStashedMaterials(b: Blueprint): Materials {
    return {
        ore: Math.max(...allMaterials.map((m) => b[m].ore)),
        clay: Math.max(...allMaterials.map((m) => b[m].clay)),
        obsidian: Math.max(...allMaterials.map((m) => b[m].obsidian)),
        geode: Number.MAX_SAFE_INTEGER,
    };
}

function geMaterials(a: Materials, b: Materials): boolean {
    return a.ore >= b.ore && a.clay >= b.clay && a.obsidian >= b.obsidian && a.geode >= b.geode;
}

function leMaterials(a: Materials, b: Materials): boolean {
    return a.ore <= b.ore && a.clay <= b.clay && a.obsidian <= b.obsidian && a.geode <= b.geode;
}

function addMaterials(a: Materials, b: Materials): Materials {
    return {
        ore: a.ore + b.ore,
        clay: a.clay + b.clay,
        obsidian: a.obsidian + b.obsidian,
        geode: a.geode + b.geode,
    };
}

function subMaterials(a: Materials, b: Materials): Materials {
    return {
        ore: a.ore - b.ore,
        clay: a.clay - b.clay,
        obsidian: a.obsidian - b.obsidian,
        geode: a.geode - b.geode,
    };
}

function potentialGeodesToBuild(s: SearchState): number {
    // Assume that every tick we are able to add a geode robot
    // So, we are able to build the following geodes:
    // `s.robots.geode + (s.robots.geode + 1) + ... (s.robots.geode + s.timeLeft)`
    const f = s.robots.geode * s.timeLeft + (s.timeLeft * (s.timeLeft + 1) / 2);
    return s.stored.geode + f;
}

export function maxGeodes(b: Blueprint, totalTime: number): number {
    let max = 0;
    const maxMaterials = maxStashedMaterials(b);
    const queue: MinHeap<SearchState> = new MinHeap((a, b) =>
        potentialGeodesToBuild(a) > potentialGeodesToBuild(b)
    );
    const seen: Set<string> = new Set();

    queue.push({
        timeLeft: totalTime,
        stored: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
        robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
        allowedToBuild: { ore: true, clay: true, obsidian: true, geode: true },
    });

    while (queue.length > 0) {
        // Pop an element from the queue
        const s = queue.pop();

        // No point in investigating sub-trees which can produce less geodes than current max
        if (potentialGeodesToBuild(s) < max) continue;

        // Don't re-visit states
        const sHash = stateHash(s);
        if (seen.has(sHash)) continue;
        seen.add(sHash);

        // No more time available - update max
        if (s.timeLeft === 0) {
            max = Math.max(max, s.stored.geode ?? 0);
            continue;
        }

        // Check which robots could have been build, to disallow them in the nothing-built state
        // This is to disallow postponing of building new robots.
        const buildableRobots: Record<Material, boolean> = {
            ore: false,
            clay: false,
            obsidian: false,
            geode: false,
        };

        // Add all states where a robot has been built
        for (const robot of allMaterials) {
            const canBuild = geMaterials(s.stored, b[robot]) && s.allowedToBuild[robot];
            if (!canBuild) continue;

            buildableRobots[robot] = true;

            const builtState: SearchState = {
                timeLeft: s.timeLeft - 1,
                stored: subMaterials(addMaterials(s.stored, s.robots), b[robot]),
                robots: { ...s.robots },
                allowedToBuild: { ore: true, clay: true, obsidian: true, geode: true },
            };
            builtState.robots[robot] += 1;

            // Skip building if producing the robot would cause material overflow
            if (!leMaterials(builtState.robots, maxMaterials)) continue;

            queue.push(builtState);
        }

        // Add a state where no robot has been built
        queue.push({
            timeLeft: s.timeLeft - 1,
            stored: addMaterials(s.stored, s.robots),
            robots: s.robots,
            allowedToBuild: {
                ore: s.allowedToBuild.ore && !buildableRobots.ore,
                clay: s.allowedToBuild.clay && !buildableRobots.clay,
                obsidian: s.allowedToBuild.obsidian && !buildableRobots.obsidian,
                geode: s.allowedToBuild.geode && !buildableRobots.geode,
            },
        });
    }

    return max;
}

export function main(): void {
    const blueprints = loadBlueprints();
    let sum = 0;
    for (const [id, b] of blueprints) {
        console.log(`Blueprint ${id}`);
        sum += id * maxGeodes(b, 24);
    }
    console.log(sum);
}
