import { Stdin } from "../src/index";

console.log("--- Stream Reads ---");

const lines = Stdin.streamReads("Enter script lines: ");

console.log(lines);
