# AGENTS.md

- Keep changes focused on the requested scope.
- Prefer TypeScript strict-mode friendly types over `any`.
- Use synchronous Node.js APIs consistently for this stdin utility.
- Run `npm run build` after TypeScript source changes when feasible.

OK: [src/index.ts (line 10)] の read() が 1024 bytes 固定なので、長い入力が途中で切れます。改行または EOF までループして読む実装にすると安全です。

[src/index.ts (line 12)] の BUF_SIZE は毎回定義されています。private static readonly BUF_SIZE = 1024 のようにクラス定数化すると意図が明確になります。

OK: [src/index.ts (line 36)] の区切り正規表現は split(/[,;\t|\s]+/) に簡略化できます。現状の /\,|\;|\t|\||\s+/ でも動きますが、少し読みづらいです。

OK: [src/index.ts (line 42)] の streamReads() は process.stdout.write(prompt) 後に read("") を呼ぶので構造は悪くないですが、read() 側がプロンプト出力まで担当しているため責務がやや混ざっています。内部用に「読むだけ」の関数を分けると整理できます。

OK: [src/index.ts (line 79)]
の object() は schema 省略時の型と実装が少しズレています。schema なしなら { [K in keyof L]: string } を返す overload を追加すると型安全性が上がります。

OK: [src/index.ts (line 96)]
の const result = {} as any は最小化できます。Partial<{ [K in keyof L]: ReturnType<S[K]> }> を使うと any の範囲を狭められます。

([src/index.ts (line 127)]) の objectWithZod は schema.shape に依存しています。Zod の内部構造寄りなので、将来互換性を重視するならアクセス方法を薄くラップするか、対象を z.ZodObject<z.ZodRawShape> に寄せるとよさそうです。

([src/index.ts (line 142)]) の for (const key in label) は schema 側のキーではなく label 側を走査します。label に余分なキーが入った場合を避けるなら、Object.keys(schema.shape) を基準に読む方が堅いです。
