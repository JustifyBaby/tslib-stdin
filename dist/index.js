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
const string_decoder_1 = require("string_decoder");
const zod_1 = require("zod");
class Stdin {
    static READ_BUFFER_SIZE = 1024;
    static pendingInput = "";
    static takePendingLine() {
        const newlineIndex = this.pendingInput.indexOf("\n");
        if (newlineIndex === -1)
            return undefined;
        const line = this.pendingInput.slice(0, newlineIndex).replace(/\r$/, "");
        this.pendingInput = this.pendingInput.slice(newlineIndex + 1);
        return line;
    }
    static readLine() {
        const decoder = new string_decoder_1.StringDecoder("utf8");
        while (true) {
            const pendingLine = this.takePendingLine();
            if (pendingLine !== undefined)
                return pendingLine;
            const buffer = Buffer.alloc(this.READ_BUFFER_SIZE);
            const bytesRead = fs.readSync(0, buffer, 0, this.READ_BUFFER_SIZE, null);
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
    static read(prompt) {
        process.stdout.write(prompt);
        return this.readLine();
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
        const items = raw.split(/[,;\t|\s]+/).filter((v) => v.length > 0);
        if (!parser)
            return items;
        return items.map(parser);
    }
    static streamReads(prompt, end = (line) => line === "") {
        process.stdout.write(prompt);
        const lines = [];
        let index = 0;
        while (true) {
            const line = this.readLine();
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
        const result = {};
        for (const key of Object.keys(label)) {
            const definition = schema ? schema[key] : String;
            let raw;
            if (isStream) {
                raw = this.streamReadText(prompt(label[key]), streamEnd);
            }
            else {
                raw = this.read(prompt(label[key]));
            }
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
