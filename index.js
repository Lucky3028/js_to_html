// ファイルの変更通知をしてくれるモジュール
const chokidar = require("chokidar");
// ファイルシステムモジュール
const fs = require('fs');
// 色を付けるためのモジュール
require('colors');

// chokidarの初期化
const watcher = chokidar.watch('./scripts/',{
  ignored:/[\/\\]\./,
  persistent: true
});

// コピーする元のhtmlファイル名
const SRC_HTML = 'template.html';

// HH:MM:SS のかたちで現在時刻を取得。1桁の場合0埋め
function getDate() {
  const now = new Date();
  return (("00" + now.getHours()).slice(-2) + ':' +
            ("00" + now.getMinutes()).slice(-2) + ':' +
            ("00" + now.getSeconds()).slice(-2)).gray;
}

function getFileName(path) {
  // pathをフォルダ階層ごとに分離する
  const splittedPath = path.split('\\');
  // ファイル名のみにして拡張子を削除する
  return splittedPath[splittedPath.length - 1].replace('.js', "");
}

function isJavaScriptFile(path) {
  return path.includes('.js')
}

// pathを受け取り、ファイル名と同じ名前のhtmlファイルを作成する
function generateHtmlFileName(path) {
  return `${getFileName(path)}.html`
}

// イベント定義
watcher.on('ready',function(){

    console.log(`[${getDate()}] Ready watching...`);

    // jsファイルが追加されたら
    watcher.on('add',function(path){
      if (!isJavaScriptFile(path)) return;

      const dest = generateHtmlFileName(path);

      // SRC_HTMLに指定されたhtmlのコピーを作成し（すでに存在するなら上書き）、追加されたjsと同じファイル名にリネーム
      fs.copyFileSync(SRC_HTML, dest);

      // html構造で指定されているjsを、追加されたjsに変更
      let html = fs.readFileSync(dest, 'UTF-8');
      html = html.replace('scripts/template.js', path);
      fs.writeFileSync(dest, html);

      console.log(`[${getDate()}] '${dest.cyan}' added.`);
    });

    // jsファイルが削除されたら
    watcher.on('unlink', function (path) {
      if (!isJavaScriptFile(path)) return;

      const dest = generateHtmlFileName(path);

      try {
        // 同名のhtmlを削除
        fs.unlinkSync(dest);
        console.log(`[${getDate()}] '${dest.cyan}' removed.`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(`[${getDate()}] '${path.cyan}' was removed, but '${dest.cyan}' was not found.`)
        }
      }
  });
});
