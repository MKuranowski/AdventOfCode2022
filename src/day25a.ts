// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

import { linesFromFile } from "./core.ts";

function snafu2dec(s: string): number {
    let x = 0;
    let p = 1;

    for (let i = s.length - 1; i >= 0; --i) {
        const digit = s[i];
        switch (digit) {
            case "0":
                break;
            case "1":
                x += 1 * p;
                break;
            case "2":
                x += 2 * p;
                break;
            case "-":
                x -= 1 * p;
                break;
            case "=":
                x -= 2 * p;
                break;
            default:
                throw `Invalid SNAFU digit: ${digit}`;
        }

        p *= 5;
    }

    return x;
}

function dec2snafu(n: number): string {
    if (n === 0) return "0";
    const digits: string[] = [];

    while (n > 0) {
        switch (n % 5) {
            case 0:
                digits.push("0");
                break;
            case 1:
                digits.push("1");
                break;
            case 2:
                digits.push("2");
                break;
            case 3:
                digits.push("=");
                n += 5;
                break;
            case 4:
                digits.push("-");
                n += 5;
                break;
        }

        n = Math.floor(n / 5);
    }

    return digits.reverse().join("");
}

export function main(): void {
    const sum = linesFromFile(Deno.args[0]).map((l) => snafu2dec(l)).reduce((a, b) => a + b);
    console.log(dec2snafu(sum));
}
