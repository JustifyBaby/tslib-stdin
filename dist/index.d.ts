type PromptFunc = (key: string) => string;
type TransformFunc<T = any> = (val: string) => T;
export declare class Stdin {
    /** * 1行読み込みのコアロジック
     */
    private static read;
    static input(prompt: string): string;
    /**
     * スペース区切りの入力を配列に変換
     * @param prompt プロンプト
     * @param parser 変換関数 (Number など)
     */
    static inputs<T = string>(prompt: string, parser?: (v: string) => T): T[];
    static streamReads(prompt: string, end?: (line: string, index: number) => boolean): string[];
    static streamReadText(prompt: string, end?: (line: string, index: number) => boolean): string;
    /**
     * オブジェクト形式での一括入力
     */
    static object<S extends Record<string, string>, R extends {
        [K in keyof S]: TransformFunc;
    }>(schema: S, rule?: R, prompt?: PromptFunc): {
        [K in keyof S]: ReturnType<R[K]>;
    };
}
export {};
