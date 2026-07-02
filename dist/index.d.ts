import { z } from "zod";
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
    static object<L extends Record<string, string>, S extends {
        [K in keyof L]: TransformFunc;
    }>(label: L, schema?: S, prompt?: PromptFunc): {
        [K in keyof S]: ReturnType<S[K]>;
    };
    static object<L extends Record<string, string>, S extends {
        [K in keyof L]: TransformFunc;
    }>(label: L, schema?: S, prompt?: PromptFunc, isStream?: boolean, streamEnd?: (line: string, index: number) => boolean): {
        [K in keyof L]: ReturnType<S[K]>;
    };
    static objectWithZod<S extends z.ZodObject<any>>(schema: S, label: {
        [K in keyof z.infer<S>]: string;
    }, prompt?: PromptFunc): z.ZodSafeParseResult<z.infer<S>>;
    static objectWithZod<S extends z.ZodObject<any>>(schema: S, label: {
        [K in keyof z.infer<S>]: string;
    }, prompt?: PromptFunc, isStream?: boolean, streamEnd?: (line: string, index: number) => boolean): z.ZodSafeParseResult<z.infer<S>>;
}
export {};
