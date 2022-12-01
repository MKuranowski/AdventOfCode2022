import { splitOn, linesFromFile } from "./core.ts";

const lines = splitOn(linesFromFile(Deno.args[0]), (l: string) => l === "");
const calories = lines.map(elf => elf.map(snack => parseInt(snack, 10)));
const calorieSums = calories.map(elf => elf.reduce((a, b) => a + b));
calorieSums.sort((a, b) => b - a);
console.log(calorieSums.slice(0, 3).reduce((a, b) => a + b));
