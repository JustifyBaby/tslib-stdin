import { Stdin } from "../src/index";

console.log("--- Array Inputs ---");

const scores = Stdin.inputs("Enter scores (e.g. 80, 95; 70): ", Number);
const total = scores.reduce((a, b) => a + b, 0);

console.log(`Average score: ${total / scores.length}`);
