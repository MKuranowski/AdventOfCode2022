import { Calculator, loadInput, Node } from "./day21a.ts";

export class ReversibleCalculator extends Calculator {
    reverseValueFor(ndID: string, expected: number): void {
        if (isNaN(expected)) throw "Can't expect something to equal NaN";

        // Check if we already have a value
        const value = this.valueFor(ndID);
        if (value === expected) return;

        const nd = this.data.get(ndID)!;

        if (typeof nd === "number") {
            if (isNaN(nd)) this.data.set(ndID, expected);
            else throw `Node ${ndID}: expected ${expected}; got ${nd}`;
        } else {
            const a = this.valueFor(nd.a);
            const b = this.valueFor(nd.b);
            if (isNaN(a) && isNaN(b)) throw `Two unknowns at node ${ndID}`;
            else if (!isNaN(a) && !isNaN(b)) throw `No unknowns at node ${ndID}`;

            switch (nd.op) {
                case "=":
                    if (expected !== 1) {
                        throw `Can't expect anything other than 1 for equality (got ${expected})`;
                    } else if (isNaN(a)) {
                        this.reverseValueFor(nd.a, b);
                    } else {
                        this.reverseValueFor(nd.b, a);
                    }
                    break;

                case "+":
                    if (isNaN(a)) {
                        this.reverseValueFor(nd.a, expected - b);
                    } else {
                        this.reverseValueFor(nd.b, expected - a);
                    }
                    break;

                case "-":
                    if (isNaN(a)) {
                        this.reverseValueFor(nd.a, expected + b);
                    } else {
                        this.reverseValueFor(nd.b, a - expected);
                    }
                    break;

                case "*":
                    if (isNaN(a)) {
                        this.reverseValueFor(nd.a, expected / b);
                    } else {
                        this.reverseValueFor(nd.b, expected / a);
                    }
                    break;

                case "/":
                    if (isNaN(a)) {
                        this.reverseValueFor(nd.a, expected * b);
                    } else {
                        this.reverseValueFor(nd.b, a / expected);
                    }
                    break;

                default:
                    throw `Invalid op: ${nd.op}`;
            }
        }
    }
}

function modifyGraph(d: Map<string, Node>) {
    const root = d.get("root")!;
    if (typeof root === "number") throw "root can't be a number";
    root.op = "=";
    d.set("humn", NaN);
}

export function main(): void {
    const data = loadInput();
    modifyGraph(data);
    const c = new ReversibleCalculator(data);
    c.reverseValueFor("root", 1);
    console.log(c.data.get("humn"));
}
