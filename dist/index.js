"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stdin = void 0;
const fs = __importStar(require("fs"));
const zod_1 = require("zod");
class Stdin {
    /** * 1行読み込みのコアロジック
     */
    static read(prompt) {
        process.stdout.write(prompt);
        const BUF_SIZE = 1024;
        const buffer = Buffer.alloc(BUF_SIZE);
        const bytesRead = fs.readSync(0, buffer, 0, BUF_SIZE, null);
        // 改行を消して文字列を返す
        return buffer.toString("utf8", 0, bytesRead).replace(/\r?\n$/, "");
    }
    static input(prompt) {
        return this.read(prompt);
    }
    /**
     * スペース区切りの入力を配列に変換
     * @param prompt プロンプト
     * @param parser 変換関数 (Number など)
     */
    static inputs(prompt, parser) {
        const raw = this.read(prompt);
        // スペースで分割し、空文字を除去
        const items = raw.split(/\,|\;|\t|\||\s+/).filter((v) => v.length > 0);
        if (!parser)
            return items;
        return items.map(parser);
    }
    static streamReads(prompt, end = (line) => line === "") {
        process.stdout.write(prompt);
        const lines = [];
        let index = 0;
        while (true) {
            const line = this.read("");
            if (end(line, index))
                break;
            lines.push(line);
            index++;
        }
        return lines;
    }
    static streamReadText(prompt, end = (line) => line === "") {
        return this.streamReads(prompt, end).join("\n");
    }
    /**
     * オブジェクト形式での一括入力
     */
    static object(label, schema, prompt = (key) => `${key}: `, isStream = false, streamEnd = (line) => line === "") {
        // 戻り値は関数の戻り値型に固定
        const result = {};
        for (const key in label) {
            const definition = schema ? schema[key] : String;
            let raw;
            if (isStream) {
                raw = this.streamReadText(prompt(label[key]), streamEnd);
            }
            else {
                raw = this.read(prompt(label[key]));
            }
            // R の制約により definition は必ず関数であることが保証されているが
            // 念のため実行。Number(raw) や String(raw) がここで動く
            result[key] = definition(raw);
        }
        return result;
    }
    static objectWithZod(schema, label, prompt = (key) => `${key}: `, isStream = false, streamEnd = (line) => line === "") {
        const result = {};
        const labelKeys = Object.keys(schema.shape);
        const schemaInto = {};
        for (const labelSchemaKey of labelKeys) {
            schemaInto[labelSchemaKey] = zod_1.z.string();
        }
        const parse = zod_1.z.object(schemaInto).safeParse(label);
        if (!parse.success) {
            throw new Error(zod_1.z.treeifyError(parse.error).errors.join("\n"));
        }
        for (const key in label) {
            let raw;
            if (isStream) {
                raw = this.streamReadText(prompt(parse.data[key]), streamEnd);
            }
            else {
                raw = this.read(prompt(parse.data[key]));
            }
            result[key] = raw;
        }
        // ZodのResult型を返す
        return schema.safeParse(result);
    }
}
exports.Stdin = Stdin;
