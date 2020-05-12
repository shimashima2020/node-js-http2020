'use strict';

const http = require('http');
const pug = require('pug');

//Basic認証をするためのモジュールの読み込み
const auth = require('http-auth');
const basic = auth.basic(
  //realmプロパティに、Basic認証時に保護する領域を規定する
  {realm: 'Enquetes Area.'},
  //無名関数で、ユーザー名とパスワードを設定
  (username, password, callback) => {
    callback(username === 'guest' && password === 'xaXZJQmE');
  }
);
const server = http
  //第一引数にbasicオブジェクトを渡してBasic認証に対応させる
  .createServer(basic, (req, res) => {
    const now = new Date();
    console.info(
      '[' + now + '] Requested by ' + req.connection.remoteAddress
    );

    //パスが /logout である時には、ステータスコード401を返す
    //メッセージ「ログアウトしました」をコンテンツとして書き出し
    //res.endでレスポンスを終了
    if (req.url === '/logout') {
      res.writeHead(401, {
        'Content-Type' : 'text/plain; charset=utf-8'
      });
      res.end('ログアウトしました');

      //この関数の実行を終了
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    switch (req.method) {
      case 'GET':
        if (req.url === '/enquetes/yaki-shabu') {
          res.write(pug.renderFile('./form.pug', {
            path: req.url,
            firstItem: '焼き肉', 
            secondItem: 'しゃぶしゃぶ'
          }));
        } else if (req.url === '/enquetes/rice-bread') {
          res.write(pug.renderFile('./form.pug', {
            path: req.url,
            firstItem: 'ごはん', 
            secondItem: 'パン'
          }));
        } else if (req.url === '/enquetes/sushi-pizza') {
          res.write(pug.renderFile('./form.pug', {
            path: req.url,
            firstItem: 'お寿司', 
            secondItem: 'ピザ'
          }));
        }
        res.end();
        break;
      case 'POST':
        let rawData = '';
        req
          .on('data', chunk => {
            rawData = rawData + chunk;
          }).on('end', () => {
            const qs = require('querystring');
            const decoded = decodeURIComponent(rawData);
            console.info('[' + now + '] 投稿: ' + decoded);
            const answer = qs.parse(decoded);
            res.write('<!DOCTYPE html><html lang="ja"><body><h1>' +
              answer['name'] + 'さんは' + answer['favorite'] +
              'に投票しました</h1></body></html>');
            res.end();
          });
        break;
      default:
        break;
    }

  })
  .on('error', e => {
    console.error('[' + new Date() + '] Server Error', e);
  })
  .on('clientError', e => {
    console.error('[' + new Date() + '] Client Error', e);
  });
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info('[' + new Date() + '] Listening on' + port);
});