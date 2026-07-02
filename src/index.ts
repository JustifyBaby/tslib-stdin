import * as fs from "fs";
import { z } from "zod";

type PromptFunc = (key: string) => string;
type TransformFunc<T = any> = (val: string) => T;

export class Stdin {
  /** * 1行読み込みのコアロジック
   */
  private static read(prompt: string): string {
    process.stdout.write(prompt);
    const BUF_SIZE = 1024;
    const buffer = Buffer.alloc(BUF_SIZE);

    const bytesRead = fs.readSync(0, buffer, 0, BUF_SIZE, null);

    // 改行を消して文字列を返す
    return buffer.toString("utf8", 0, bytesRead).replace(/\r?\n$/, "");
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
    const items = raw.split(/\,|\;|\t|\||\s+/).filter((v) => v.length > 0);

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
      const line = this.read("");
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

  public static object<
    L extends Record<string, string>,
    S extends { [K in keyof L]: TransformFunc }, // ここで関数以外を弾く
  >(
    label: L,
    schema?: S,
    prompt?: PromptFunc,
  ): { [K in keyof S]: ReturnType<S[K]> };

  public static object<
    L extends Record<string, string>,
    S extends { [K in keyof L]: TransformFunc }, // ここで関数以外を弾く
  >(
    label: L,
    schema?: S,
    prompt?: PromptFunc,
    isStream?: boolean,
    streamEnd?: (line: string, index: number) => boolean,
  ): { [K in keyof L]: ReturnType<S[K]> };

  /**
   * オブジェクト形式での一括入力
   */
  public static object<
    L extends Record<string, string>,
    S extends { [K in keyof L]: TransformFunc }, // ここで関数以外を弾く
  >(
    label: L,
    schema?: S,
    prompt: PromptFunc = (key) => `${key}: `,
    isStream: boolean = false,
    streamEnd: (line: string, index: number) => boolean = (line) => line === "",
  ): { [K in keyof L]: ReturnType<S[K]> } {
    // 戻り値は関数の戻り値型に固定

    const result = {} as any;

    for (const key in label) {
      const definition = schema ? schema[key as keyof L] : String;

      let raw: string;
      if (isStream) {
        raw = this.streamReadText(prompt(label[key]), streamEnd);
      } else {
        raw = this.read(prompt(label[key]));
      }

      // R の制約により definition は必ず関数であることが保証されているが
      // 念のため実行。Number(raw) や String(raw) がここで動く
      result[key] = definition(raw);
    }

    return result;
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
