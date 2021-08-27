# ac-releace-monitor

Apple Configuratior 2 の release notes を定期的に監視するツールです。

## 起動させるまで

```
$ npm i 
$ npm run dev
```

## 概要

`npm run dev` で Express サーバーを起動させると、cron（`src/services/cronService.ts` で指定できる）に指定した時刻で定期的に [Apple Configurator の新機能](https://support.apple.com/ja-jp/HT208040) のHTMLファイルを取得します。

1つ前に取得したHTMLファイルと今回取得したHTMLファイルで diff を取り、差分があった場合は  [Apple Configurator の新機能](https://support.apple.com/ja-jp/HT208040) をスクレイピングして
最上部に新機能の情報を取得します。

使っている技術は以下のとおりです。

- Node
- Express
- [Playwright](https://github.com/microsoft/playwright)
- jsdiff
- cron

### やっていること

`src/cronService.ts` で以下の処理を定期実行しています。

1. 1つ前のファイル（before-latest.html）を削除
2. 現時点で最新のファイル（latest.html）を1つ前のファイル（before-latest.html）としてリネームする
3. Apple Configuration のサイトから HTML をダウンロードして latest.html として保存する
4. latest.html と before-latest.html を比較する 
5. 差分がある場合は Apple Configurator 2 のリリースノートのページをスクレイピングして、最新情報を取得

以下の機能が未実装です。

- 最新情報をチャットに通知する

### ディレクトリ構造と内容

```
$ tree -r            
├── tsconfig.json
├── src
│   ├── utils
│   │   └── index.ts
│   ├── types
│   │   └── acFunction.ts  # 型定義ファイル
│   ├── services
│   │   ├── scrapingService.ts   # ACサイトをスクレイピングするサービス
│   │   ├── fileDownloadService.ts  # ファイルを操作するサービス
│   │   └── cronService.ts  # cronジョブを実行するサービス
│   ├── routes
│   │   └── index.ts
│   ├── files # ファイルのダウンロード先のディレクトリ。
│   │   ├── latest.html
│   │   └── before-latest.html
│   ├── controllers
│   │   └── index.ts
│   └── app.ts  # Express の起動となる起点
├── package.json
├── package-lock.json
├── README.md
└── LICENSE

```