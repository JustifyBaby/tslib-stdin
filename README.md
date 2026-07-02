# tslib-stdin

A Python-inspired, type-safe, synchronous standard input utility for TypeScript/Node.js.

Stop wrestling with asynchronous `readline` or callbacks just to get simple user input. **tslib-stdin** allows you to handle CLI inputs synchronously, with powerful type inference and object mapping.

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
npm install tslib-stdin
```

---

## Quick Start

### 1. Basic Input

```typescript
import { Stdin } from "tslib-stdin";

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

### 4. Multi-line Input

Read multiple lines until an empty line is entered.

```typescript
const lines = Stdin.streamReads("Enter text (empty line to finish): ");

console.log(lines);
// ["Hello", "World", "TypeScript"]
```

### 5. Multi-line Text

Read multiple lines and return them as a single string.

```typescript
const text = Stdin.streamReadText("Enter text (empty line to finish): ");

console.log(text);
/*
Hello
World
TypeScript
*/
```

---

## API Reference

### `Stdin.input(prompt: string): string`

Reads a single line from `stdin` and returns it as a string.

- `prompt`: Text written to `stdout` before reading.
- Trailing newline (`\n` or `\r\n`) is removed from the returned value.

### `Stdin.inputs<T = string>(prompt: string, parser?: (v: string) => T): T[]`

Reads one line, splits it into multiple values, and optionally transforms each value.

- `prompt`: Text written before reading.
- `parser`: Optional transform function such as `Number` or a custom parser.
- Split delimiters: comma, semicolon, tab, pipe, and whitespace.
- Empty items are removed.

### `Stdin.streamReads(prompt: string, end?: (line: string, index: number) => boolean): string[]`

Reads multiple lines from `stdin` until the end condition is met.

- `prompt`: Text written once before the multi-line input starts.
- `end`: Optional predicate that stops input. Default: empty line (`line === ""`).
- Returns the collected lines as `string[]`.
- The terminating line is not included in the result.

### `Stdin.streamReadText(prompt: string, end?: (line: string, index: number) => boolean): string`

Reads multiple lines and returns them as a single string.

- Uses `Stdin.streamReads(...)` internally.
- Joins lines with `\n`.
- `end` defaults to empty line (`line === ""`).

### `Stdin.object<L, S>(label: L, schema?: S, prompt?: (key: string) => string, isStream?: boolean, streamEnd?: (line: string, index: number) => boolean): { [K in keyof L]: ReturnType<S[K]> }`

Collects values for each field in `label` and returns an object transformed by `schema`.

- `label`: `{ key: promptLabel }`. Each value is passed to the prompt formatter.
- `schema`: Optional transform map for each key. If omitted, values are converted with `String`.
- `prompt`: Optional prompt formatter. Default: `(key) => \`${key}: \``.
- `isStream`: If `true`, each field is read as multi-line text via `streamReadText`.
- `streamEnd`: End condition used when `isStream` is `true`. Default: empty line.

Example:

```typescript
const user = Stdin.object(
  { id: "Employee ID", name: "Full Name" },
  { id: Number, name: String },
);
```

### `Stdin.objectWithZod<S extends z.ZodObject<any>>(schema: S, label: { [K in keyof z.infer<S>]: string }, prompt?: (key: string) => string, isStream?: boolean, streamEnd?: (line: string, index: number) => boolean): z.ZodSafeParseResult<z.infer<S>>`

Collects raw string input for each field, then validates it with a Zod object schema.

- `schema`: Zod object schema used for validation.
- `label`: Prompt labels keyed by the same fields as the schema.
- `prompt`: Optional prompt formatter. Default: `(key) => \`${key}: \``.
- `isStream`: If `true`, each field is read as multi-line text.
- `streamEnd`: End condition for multi-line mode. Default: empty line.
- Returns the result of `schema.safeParse(...)`.

Example:

```typescript
import { z } from "zod";

const result = Stdin.objectWithZod(
  z.object({
    age: z.coerce.number().int().min(0),
    // Not string type need to coerce or transform
    name: z.string().min(1),
  }),
  {
    age: "Age",
    name: "Name",
  },
);

if (result.success) {
  console.log(result.data.age);
}
```

**notice**
_Not string type need to coerce or transform_

---

## License

MIT

```
MIT License

Copyright (c) 2026 JustifyBaby

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```
