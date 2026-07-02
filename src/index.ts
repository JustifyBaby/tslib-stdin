import * as fs from "fs";
import { StringDecoder } from "string_decoder";
import { z } from "zod";

type PromptFunc = (key: string) => string;
type TransformFunc<T = unknown> = (val: string) => T;
type SchemaFor<L extends Record<string, string>> = {
  [K in keyof L]: TransformFunc;
};
type ObjectResult<
  L extends Record<string, string>,
  S extends SchemaFor<L>,
> = {
  [K in keyof L]: ReturnType<S[K]>;
};

export class Stdin {
  private static readonly READ_BUFFER_SIZE = 1024;
  private static pendingInput = "";

  private static takePendingLine(): string | undefined {
    const newlineIndex = this.pendingInput.indexOf("\n");
    if (newlineIndex === -1) return undefined;

    const line = this.pendingInput.slice(0, newlineIndex).replace(/\r$/, "");
    this.pendingInput = this.pendingInput.slice(newlineIndex + 1);
    return line;
  }

  private static readLine(): string {
    const decoder = new StringDecoder("utf8");

    while (true) {
      const pendingLine = this.takePendingLine();
      if (pendingLine !== undefined) return pendingLine;

      const buffer = Buffer.alloc(this.READ_BUFFER_SIZE);
      const bytesRead = fs.readSync(
        0,
        buffer,
        0,
        this.READ_BUFFER_SIZE,
        null,
      );

      if (bytesRead === 0) {
        const rest = this.pendingInput + decoder.end();
        this.pendingInput = "";
        return rest.replace(/\r$/, "");
      }

      this.pendingInput += decoder.write(buffer.subarray(0, bytesRead));
    }
  }

  /** * 1行読み込みのコアロジック
   */
  private static read(prompt: string): string {
    process.stdout.write(prompt);
    return this.readLine();
  }

  public static input(prompt: string): string {
    return this.read(prompt);
  }

  /**
   * スペース区切りの入力を配列に変換
   * @param prompt プロンプト
   * @param parser 変換関数 (Number など)
   */
  public static inputs<T = string>(
    prompt: string,
    parser?: (v: string) => T,
  ): T[] {
    const raw = this.read(prompt);
    // スペースで分割し、空文字を除去
    const items = raw.split(/[,;\t|\s]+/).filter((v) => v.length > 0);

    if (!parser) return items as unknown as T[];
    return items.map(parser);
  }

  public static streamReads(
    prompt: string,
    end: (line: string, index: number) => boolean = (line) => line === "",
  ): string[] {
    process.stdout.write(prompt);

    const lines: string[] = [];
    let index = 0;

    while (true) {
      const line = this.readLine();
      if (end(line, index)) break;
      lines.push(line);
      index++;
    }

    return lines;
  }

  public static streamReadText(
    prompt: string,
    end: (line: string, index: number) => boolean = (line) => line === "",
  ): string {
    return this.streamReads(prompt, end).join("\n");
  }

  public static object<L extends Record<string, string>>(
    label: L,
    schema?: undefined,
    prompt?: PromptFunc,
  ): { [K in keyof L]: string };

  public static object<L extends Record<string, string>>(
    label: L,
    schema?: undefined,
    prompt?: PromptFunc,
    isStream?: boolean,
    streamEnd?: (line: string, index: number) => boolean,
  ): { [K in keyof L]: string };

  public static object<
    L extends Record<string, string>,
    S extends SchemaFor<L>,
  >(label: L, schema: S, prompt?: PromptFunc): ObjectResult<L, S>;

  public static object<
    L extends Record<string, string>,
    S extends SchemaFor<L>,
  >(
    label: L,
    schema: S,
    prompt?: PromptFunc,
    isStream?: boolean,
    streamEnd?: (line: string, index: number) => boolean,
  ): ObjectResult<L, S>;

  /**
   * オブジェクト形式での一括入力
   */
  public static object<
    L extends Record<string, string>,
    S extends SchemaFor<L>,
  >(
    label: L,
    schema?: S,
    prompt: PromptFunc = (key) => `${key}: `,
    isStream: boolean = false,
    streamEnd: (line: string, index: number) => boolean = (line) => line === "",
  ): { [K in keyof L]: string | ReturnType<S[keyof S]> } {
    const result: Partial<{ [K in keyof L]: string | ReturnType<S[keyof S]> }> =
      {};

    for (const key of Object.keys(label) as (keyof L)[]) {
      const definition: TransformFunc = schema ? schema[key] : String;

      let raw: string;
      if (isStream) {
        raw = this.streamReadText(prompt(label[key]), streamEnd);
      } else {
        raw = this.read(prompt(label[key]));
      }

      result[key] = definition(raw) as string | ReturnType<S[keyof S]>;
    }

    return result as { [K in keyof L]: string | ReturnType<S[keyof S]> };
  }

  public static objectWithZod<S extends z.ZodObject<any>>(
    schema: S,
    label: { [K in keyof z.infer<S>]: string },
    prompt?: PromptFunc,
  ): z.ZodSafeParseResult<z.infer<S>>;

  public static objectWithZod<S extends z.ZodObject<any>>(
    schema: S,
    label: { [K in keyof z.infer<S>]: string },
    prompt?: PromptFunc,
    isStream?: boolean,
    streamEnd?: (line: string, index: number) => boolean,
  ): z.ZodSafeParseResult<z.infer<S>>;

  public static objectWithZod<S extends z.ZodObject<any>>(
    schema: S,
    label: { [K in keyof z.infer<S>]: string },
    prompt: PromptFunc = (key) => `${key}: `,
    isStream: boolean = false,
    streamEnd: (line: string, index: number) => boolean = (line) => line === "",
  ): z.ZodSafeParseResult<z.infer<S>> {
    const result: Record<any, any> = {};

    const labelKeys = Object.keys(schema.shape);
    const schemaInto: Record<string, z.ZodString> = {};
    for (const labelSchemaKey of labelKeys) {
      schemaInto[labelSchemaKey] = z.string();
    }

    const parse = z.object(schemaInto).safeParse(label);

    if (!parse.success) {
      throw new Error(z.treeifyError(parse.error).errors.join("\n"));
    }

    for (const key in label) {
      let raw: string;
      if (isStream) {
        raw = this.streamReadText(prompt(parse.data[key]), streamEnd);
      } else {
        raw = this.read(prompt(parse.data[key]));
      }

      result[key] = raw;
    }

    // ZodのResult型を返す
    return schema.safeParse(result);
  }
}
