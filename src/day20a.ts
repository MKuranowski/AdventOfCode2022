// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile, mod } from "./core.ts";

export class State {
    numbers: number[];
    toCurrentIndex: number[];

    constructor(numbers: number[]) {
        this.numbers = numbers;
        this.toCurrentIndex = new Array(numbers.length);
        for (let i = 0; i < numbers.length; ++i) this.toCurrentIndex[i] = i;
    }

    get length() {
        return this.numbers.length;
    }

    reconstruct(): number[] {
        const l = new Array(this.length);
        for (let originalIndex = 0; originalIndex < this.length; ++originalIndex) {
            l[this.toCurrentIndex[originalIndex]] = this.numbers[originalIndex];
        }
        return l;
    }

    shiftAll(): void {
        // console.log(this.reconstruct().join(", "));
        for (let originalIndex = 0; originalIndex < this.length; ++originalIndex) {
            this.shift(originalIndex);
            // console.log(this.reconstruct().join(", "));
        }
    }

    shift(originalIndex: number): void {
        const value = this.numbers[originalIndex];
        const currentIndex = this.toCurrentIndex[originalIndex];
        const newIndex = mod(currentIndex + value, this.length - 1);

        if (newIndex > currentIndex) {
            // Shift every number in range <currentIndex+1, newIndex> to the left
            for (let orig = 0; orig < this.length; ++orig) {
                const curr = this.toCurrentIndex[orig];
                if (curr > currentIndex && curr <= newIndex) {
                    this.toCurrentIndex[orig] = curr - 1;
                }
            }
        } else if (newIndex < currentIndex) {
            // Shift every number in range <newIndex, currentIndex-1> to the right
            for (let orig = 0; orig < this.length; ++orig) {
                const curr = this.toCurrentIndex[orig];
                if (curr < currentIndex && curr >= newIndex) {
                    this.toCurrentIndex[orig] = curr + 1;
                }
            }
        }

        this.toCurrentIndex[originalIndex] = newIndex;
    }

    static runOn(numbers: number[], mixTimes = 1): number[] {
        const s = new State(numbers);
        for (let i = 0; i < mixTimes; ++i) s.shiftAll();
        return s.reconstruct();
    }
}

export function main(): void {
    const numbers = linesFromFile(Deno.args[0]).map((l) => parseInt(l, 10));
    const newNumbers = State.runOn(numbers);

    const zeroIdx = newNumbers.indexOf(0);
    const a = newNumbers[(zeroIdx + 1000) % newNumbers.length];
    const b = newNumbers[(zeroIdx + 2000) % newNumbers.length];
    const c = newNumbers[(zeroIdx + 3000) % newNumbers.length];

    console.log(a + b + c);
}
