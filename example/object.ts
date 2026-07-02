import { Stdin } from "../src/index";

console.log("--- Object Schema ---");

type Category = "Internal" | "External";

const label = {
  id: "Project ID",
  title: "Project Title",
  category: "Category (Internal/External)",
};

const rules = {
  id: Number,
  title: String,
  category: (value: string) => value as Category,
};

const project = Stdin.object(label, rules);

console.log("\nProject Registered:");
console.log(`- ID: ${project.id} (type: ${typeof project.id})`);
console.log(`- Title: ${project.title}`);
console.log(`- Category: ${project.category}`);

console.log("\n--- Custom Prompt ---");

const custom = Stdin.object(
  { age: "Age" },
  { age: Number },
  (label) => `>>> Please enter ${label}: `,
);

console.log(`Your age is: ${custom.age}`);
