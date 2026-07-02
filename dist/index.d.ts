import { z } from "zod";
type PromptFunc = (key: string) => string;
type TransformFunc<T = unknown> = (val: string) => T;
type SchemaFor<L extends Record<string, string>> = {
    [K in keyof L]: TransformFunc;
};
type ObjectResult<L extends Record<string, string>, S extends SchemaFor<L>> = {
    [K in keyof L]: ReturnType<S[K]>;
};
export declare class Stdin {
    private static readonly READ_BUFFER_SIZE;
    private static pendingInput;
    private static takePendingLine;
    private static readLine;
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
    static object<L extends Record<string, string>>(label: L, schema?: undefined, prompt?: PromptFunc): {
        [K in keyof L]: string;
    };
    static object<L extends Record<string, string>>(label: L, schema?: undefined, prompt?: PromptFunc, isStream?: boolean, streamEnd?: (line: string, index: number) => boolean): {
        [K in keyof L]: string;
    };
    static object<L extends Record<string, string>, S extends SchemaFor<L>>(label: L, schema: S, prompt?: PromptFunc): ObjectResult<L, S>;
    static object<L extends Record<string, string>, S extends SchemaFor<L>>(label: L, schema: S, prompt?: PromptFunc, isStream?: boolean, streamEnd?: (line: string, index: number) => boolean): ObjectResult<L, S>;
    static objectWithZod<S extends z.ZodObject<any>>(schema: S, label: {
        [K in keyof z.infer<S>]: string;
    }, prompt?: PromptFunc): z.ZodSafeParseResult<z.infer<S>>;
    static objectWithZod<S extends z.ZodObject<any>>(schema: S, label: {
        [K in keyof z.infer<S>]: string;
    }, prompt?: PromptFunc, isStream?: boolean, streamEnd?: (line: string, index: number) => boolean): z.ZodSafeParseResult<z.infer<S>>;
}
export {};
