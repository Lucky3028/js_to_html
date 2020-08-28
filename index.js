// ref. 「node.jsでファイルの変更を検出して何かする」https://qiita.com/zaburo/items/0280807fe5e59026e41b
//      「Node.jsで標準出力や標準エラー出力に色付きの文字列を出力する」http://info-i.net/console-log-color
//      「node.jsでファイルの入出力操作」https://qiita.com/shirokuman/items/509b159bf4b8dd1c41ef
//      「node.jsでファイルを削除する」https://www.gesource.jp/weblog/?p=8216
//      「Node.js での例外処理: (1) try ～ catch による例外処理」https://maku77.github.io/nodejs/exception/try-and-catch.html

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

// コピーする元のhtml
const src = 'template.html';

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

// イベント定義
watcher.on('ready',function(){

    console.log(`[${getDate()}] Ready watching...`);

    // ファイルが追加されたら
    watcher.on('add',function(path){
      if (!path.includes('.js')) return;

      const dest = `${getFileName(path)}.html`;

      // 追加されたjsと同じファイル名でsrcのhtmlのコピーを作成
      fs.copyFileSync(src, dest, (err) => {
        if (err) throw err;
      });

      // htmlの中で指定されているjsのファイル名を追加されたjsと同じファイル名で書き換え。すでに存在するなら上書き
      let html = fs.readFileSync(dest, 'UTF-8');
      html = html.replace('scripts/template.js', path);
      fs.writeFileSync(dest, html);

      console.log(`[${getDate()}] '${dest.cyan}' added.`);
    });

    // ファイルが削除されたら
    watcher.on('unlink', function (path) {
      if (!path.includes('.js')) return;

      const dest = `${getFileName(path)}.html`;

      try {
        // 同名のhtmlを削除
        fs.unlinkSync(dest);
        console.log(`[${getDate()}] '${dest.cyan}' removed.`);
      } catch (err) {
        if (err.toString().includes('Error: ENOENT: no such file or directory,')) {
          console.error(`[${getDate()}] '${path.cyan}' was deleted, but '${dest.cyan}' was not found.`)
        } else {
          console.error(`[${getDate()}] ${err.toString()}`);
        }
      }
  });
});
