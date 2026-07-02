import z from "zod";
import { Stdin } from "../src/index";

console.log("--- Object With Zod ---");

const label = {
  id: "Project ID",
  title: "Project Title",
  category: "Category (Internal/External)",
};

const schema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  category: z.enum(["Internal", "External"]),
});

const parsed = Stdin.objectWithZod(schema, label);

console.log(parsed);
