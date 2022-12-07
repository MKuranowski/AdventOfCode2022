import { linesFromFile } from "./core.ts";

export class Directory {
    public children: Map<string, Directory> = new Map();
    public files: Map<string, number> = new Map();
    private cachedTotalSize: number | null = null;

    constructor(public name: string, public parent: Directory | null = null) {}

    get totalSize(): number {
        if (this.cachedTotalSize === null) {
            this.cachedTotalSize = 0;
            for (const child of this.children.values()) this.cachedTotalSize += child.totalSize;
            for (const fileSize of this.files.values()) this.cachedTotalSize += fileSize;
        }
        return this.cachedTotalSize;
    }

    public walk(onDirectory: (d: Directory) => void) {
        onDirectory(this);
        this.children.forEach(d => d.walk(onDirectory));
    }
}

export function loadInput(): Directory {
    const root = new Directory("/");
    let pwd = root;

    for (const line of linesFromFile(Deno.args[0])) {
        if (line.startsWith("$ cd")) {
            const [_dollar, _cd, into] = line.split(" ");
            switch (into) {
                case "/":
                    pwd = root;
                    break;
                case "..":
                    pwd = pwd.parent!;
                    break;
                default:
                    pwd = pwd.children.get(into)!;
                    break;
            }
        } else if (line.startsWith("$ ls")) {
            // Ignore `ls`
        } else if (line.startsWith("dir ")) {
            const [_, dirName] = line.split(" ");
            if (!pwd.children.has(dirName)) {
                pwd.children.set(dirName, new Directory(dirName, pwd));
            }
        } else {
            const [size, fileName] = line.split(" ");
            pwd.files.set(fileName, parseInt(size, 10));
        }
    }

    return root;
}

export function main(): void {
    const root = loadInput();
    let sum = 0;
    root.walk((d) => {
        if (d.totalSize <= 100000) sum += d.totalSize;
    });
    console.log(sum);
}
