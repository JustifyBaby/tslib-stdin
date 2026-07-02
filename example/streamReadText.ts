import { Stdin } from "../src/index";

console.log("--- Stream Read Text ---");

const text = Stdin.streamReadText("Enter script text: ");

console.log(text);
