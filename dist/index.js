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
class Stdin {
    /** * 1行読み込みのコアロジック
     */
    static read(prompt) {
        process.stdout.write(prompt);
        const BUF_SIZE = 1024;
        const buffer = Buffer.alloc(BUF_SIZE);
        // ts(2575) 回避のために 5引数で実行
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
    static inputs(prompt = "", parser) {
        const raw = this.read(prompt);
        // スペースで分割し、空文字を除去
        const items = raw.split(/\,|\;|\t|\||\s+/).filter((v) => v.length > 0);
        if (!parser)
            return items;
        return items.map(parser);
    }
    /**
     * オブジェクト形式での一括入力
     */
    static object(schema, rule, prompt) {
        // 戻り値は関数の戻り値型に固定
        prompt ??= (key) => `${key}: `;
        const result = {};
        for (const key in schema) {
            const definition = rule ? rule[key] : String;
            const raw = this.read(prompt(schema[key]));
            // R の制約により definition は必ず関数であることが保証されているが
            // 念のため実行。Number(raw) や String(raw) がここで動く
            result[key] = definition(raw);
        }
        return result;
    }
}
exports.Stdin = Stdin;
