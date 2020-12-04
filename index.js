// ファイルの変更通知をしてくれるモジュール
const CHOKIDAR = require("chokidar");
// ファイルシステムモジュール
const FILE_SYSTEM = require('fs');
// 色を付けるためのモジュール
require('colors');

// chokidarの初期化
const WATCHER = CHOKIDAR.watch('./scripts/', {
  ignored: /[\/\\]\./,
  persistent: true
});

// コピーする元のhtmlファイル名
const SRC_HTML = 'template.html';

// HH:MM:SS のかたちで現在時刻を取得。1桁の場合0埋め
function getTime() {
  const NOW_DATE = new Date();
  return (("00" + NOW_DATE.getHours()).slice(-2) + ':' +
    ("00" + NOW_DATE.getMinutes()).slice(-2) + ':' +
    ("00" + NOW_DATE.getSeconds()).slice(-2)).gray;
}

function getFileName(path) {
  // pathをフォルダ階層ごとに分離する
  const SPLITTED_PATH = path.split('\\');
  // ファイル名のみにして拡張子を削除する
  return SPLITTED_PATH[SPLITTED_PATH.length - 1].replace('.js', "");
}

function isJavaScriptFile(path) {
  return path.includes('.js')
}

// pathを受け取り、ファイル名と同じ名前のhtmlファイルを作成する
function generateHtmlFileName(path) {
  return `${getFileName(path)}.html`
}

// イベント定義
WATCHER.on('ready', function () {

  console.log(`[${getTime()}] Ready watching...`);

  // jsファイルが追加されたら
  WATCHER.on('add', function (path) {
    if (!isJavaScriptFile(path)) return;

    const DEST_HTML = generateHtmlFileName(path);

    // SRC_HTMLに指定されたhtmlのコピーを作成し（すでに存在するなら上書き）、追加されたjsと同じファイル名にリネーム
    FILE_SYSTEM.copyFileSync(SRC_HTML, DEST_HTML);

    // html構造で指定されているjsを、追加されたjsに変更
    let html = FILE_SYSTEM.readFileSync(DEST_HTML, 'UTF-8');
    html = html.replace('scripts/template.js', path);
    FILE_SYSTEM.writeFileSync(DEST_HTML, html);

    console.log(`[${getTime()}] '${DEST_HTML.cyan}' added.`);
  });

  // jsファイルが削除されたら
  WATCHER.on('unlink', function (path) {
    if (!isJavaScriptFile(path)) return;

    const DEST_HTML = generateHtmlFileName(path);

    try {
      // 同名のhtmlを削除
      FILE_SYSTEM.unlinkSync(DEST_HTML);
      console.log(`[${getTime()}] '${DEST_HTML.cyan}' removed.`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`[${getTime()}] '${path.cyan}' was removed, but '${DEST_HTML.cyan}' was not found.`)
      }
    }
  });
});
