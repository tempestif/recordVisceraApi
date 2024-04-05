// responseMessages.test.ts
import fs from "fs";
import path from "path";

describe("responseMessages", () => {
  it("responseMessagesのファイルがすべてindex.tsで再エクスポートされているか", () => {
    // 親ディレクトリのpathを取得
    const parentDirectory = path.join(__dirname, "..");
    // messagesディレクトリ
    const messagesDirectory = path.join(parentDirectory, "./messages");

    // index.tsの内容を取得
    const indexFile = path.join(parentDirectory, "index.ts");
    const indexContent = fs.readFileSync(indexFile, "utf-8");

    // messagesディレクトリのファイル名を繰り返し
    fs.readdirSync(messagesDirectory).forEach((file) => {
      if (file.endsWith(".ts")) {
        // export文を識別する正規表現オブジェクト
        const exportName = `messages/${file.replace(".ts", "")}`;
        const regex = new RegExp(
          `^\\s*export\\s*\\*\\s*from\\s*"\\./${exportName}";`,
          "gm"
        );

        // index.tsにexport文があるか検査
        expect(indexContent).toMatch(regex);
      }
    });
  });
});
