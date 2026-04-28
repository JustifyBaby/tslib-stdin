# ts-stdin

A Python-inspired, type-safe, synchronous standard input utility for TypeScript/Node.js.

Stop wrestling with asynchronous `readline` or callbacks just to get simple user input. **ts-stdin** allows you to handle CLI inputs synchronously, with powerful type inference and object mapping.

---

## Features

- 🚀 **Synchronous Execution**: Works just like Python's `input()`.
- 🛡️ **Type Safety**: Automatic type inference for strings, numbers, and booleans.
- 🧩 **Object Schema Mapping**: Input multiple fields at once using a schema and rules.
- 📦 **Zero Dependencies**: Purely built on Node.js `fs` and `buffer`.
- 🛠️ **Flexible Splitting**: `inputs()` handles multiple delimiters (space, comma, semicolon, pipe, etc.).

---

## Installation

```bash
npm install ts-stdin
```

---

## Quick Start

### 1. Basic Input

```typescript
import { Stdin } from "ts-stdin";

const name = Stdin.input("What is your name? ");
console.log(`Hello, ${name}!`);
```

### 2. Array Inputs (Split by delimiters)

Supports spaces, commas, tabs, pipes, and semicolons by default.

```typescript
// User Input: 10, 20, 30
const [a, b, c] = Stdin.inputs("Enter three numbers: ", Number);
console.log(a + b + c); // 60 (as number)
```

### 3. Object Schema with Strict Rules

Map multiple inputs to an object. You can use built-in constructors (`Number`, `String`) or custom transform functions for **Union Types**.

```typescript
type Rank = "Lv1" | "Lv2" | "Lv3";

const user = Stdin.object(
  {
    id: "Employee ID",
    name: "Full Name",
    rank: "Access Level",
  },
  {
    id: Number,
    name: String,
    rank: (v) => v as Rank, // Custom transform for Union Types
  },
);

// Fully typed!
console.log(user.id); // number
console.log(user.rank); // "Lv1" | "Lv2" | "Lv3"
```

---

## API Reference

### `Stdin.input(prompt: string): string`

Reads a single line from `stdin`.

### `Stdin.inputs<T>(prompt: string, parser?: (v: string) => T): T[]`

Reads a line and splits it into an array.

- **Default delimiters**: `,` `;` `\t` `|` and whitespace.
- If `parser` is provided (e.g., `Number`), it maps each element.

### `Stdin.object(schema, rule, promptFunc?)`

Collects multiple inputs based on the `schema`.

- **schema**: `{ key: label }`. The `label` is used for the prompt display.
- **rule**: `{ key: TransformFunc }`. Must match the keys in `schema`.
- **promptFunc**: Optional. Customize how the prompt is displayed.
  - Default: `(key) => `${key}: ` `

---

## License

MIT

```

```
