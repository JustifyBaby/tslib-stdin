import { Stdin } from "../src/index";
/**
 * [Example 1] Basic Input
 * Just like Python's input()
 */
console.log("--- Basic Input ---");
const name = Stdin.input("Enter your name: ");
console.log(`Hello, ${name}!\n`);

/**
 * [Example 2] Array Inputs with Auto-conversion
 * Splitting multiple values by space, comma, or semicolon
 */
console.log("--- Array Inputs ---");
const scores = Stdin.inputs("Enter scores (e.g. 80, 95; 70): ", Number);
const total = scores.reduce((a, b) => a + b, 0);
console.log(`Average score: ${total / scores.length}\n`);

/**
 * [Example 3] Strict Object Schema
 * Mapping inputs to a typed object with Union Types
 */
console.log("--- Object Schema ---");

type Category = "Internal" | "External";

// 1. Define the Schema (Labels for prompts)
const schema = {
  id: "Project ID",
  title: "Project Title",
  category: "Category (Internal/External)",
};

// 2. Define the Rules (Transformation functions)
// All keys must match the schema exactly.
const rules = {
  id: Number,
  title: String,
  category: (v: string) => v as Category,
};

// 3. Execution
const project = Stdin.object(schema, rules);

// Fully type-safe!
console.log("\nProject Registered:");
console.log(`- ID: ${project.id} (type: ${typeof project.id})`);
console.log(`- Title: ${project.title}`);
console.log(`- Category: ${project.category}`);

/**
 * [Example 4] Custom Prompt Function
 */
console.log("\n--- Custom Prompt ---");
const custom = Stdin.object(
  { age: "Age" },
  { age: Number },
  (label) => `>>> Please enter ${label}: `,
);
console.log(`Your age is: ${custom.age}`);

const multiLine = Stdin.streamReads("enter script >> ");
console.log(multiLine);

const multiLineText = Stdin.streamReadText("enter script >> ");

console.log(multiLineText);
