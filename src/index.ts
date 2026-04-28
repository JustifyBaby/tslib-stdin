import * as fs from "fs";

type PromptFunc = (key: string) => string;
type TransformFunc<T = any> = (val: string) => T;

export class Stdin {
  /** * 1行読み込みのコアロジック
   */
  private static read(prompt: string): string {
    process.stdout.write(prompt);
    const BUF_SIZE = 1024;
    const buffer = Buffer.alloc(BUF_SIZE);

    // ts(2575) 回避のために 5引数で実行
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
  static inputs<T = string>(
    prompt: string = "",
    parser?: (v: string) => T,
  ): T[] {
    const raw = this.read(prompt);
    // スペースで分割し、空文字を除去
    const items = raw.split(/\,|\;|\t|\||\s+/).filter((v) => v.length > 0);

    if (!parser) return items as unknown as T[];
    return items.map(parser);
  }

  /**
   * オブジェクト形式での一括入力
   */
  static object<
    S extends Record<string, string>,
    R extends { [K in keyof S]: TransformFunc }, // ここで関数以外を弾く
  >(
    schema: S,
    rule?: R,
    prompt?: PromptFunc,
  ): { [K in keyof S]: ReturnType<R[K]> } {
    // 戻り値は関数の戻り値型に固定

    prompt ??= (key) => `${key}: `;

    const result = {} as any;

    for (const key in schema) {
      const definition = rule ? rule[key as keyof S] : String;
      const raw = this.read(prompt(schema[key]));

      // R の制約により definition は必ず関数であることが保証されているが
      // 念のため実行。Number(raw) や String(raw) がここで動く
      result[key] = definition(raw);
    }

    return result;
  }
}
