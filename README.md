# RecordVisceraAPI

クローン病向け健康管理アプリのバックエンドアプリケーションです。
REST APIで構成されており、いつかAPI単体も提供することを考えています。

## 機能

以下のような機能を有し、それぞれにエンドポイントが設定されています。

- アカウント登録
- ログイン
- ログアウト
- メールアドレス認証
- パスワードリセット
- 体温 CRUD
- 便の調子 CRUD
- 便の回数取得
- 日次体調報告 CRUD
- プロフィール RU

## 技術スタック

- Express.js
- TypeScript
- Jest
- jsonwebtoken
- winston
- nodemailer
