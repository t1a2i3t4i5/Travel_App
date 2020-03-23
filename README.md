# Jaravlate

日本の行った県が一目でわかるSNSアプリです。<br>
自他ともに思い出を確認できます。<br>
※レスポンシブには対応していません

# URL
https://murmuring-escarpment-11805.herokuapp.com/<br>
現在はログインしていないと機能は使えません。<br>
ログインすると都道府県に対して投稿することができます。

# 言語・使用技術
#### フロント
- HTML
- Scss
- japanmap(https://takemaru-hirai.github.io/japan-map/)
- UIkit

#### バックエンド
- Ruby 2.6.3
- Ruby on Rails 5.1.6

#### DB
- sqlite3 1.3.13

#### インフラ・開発環境等
- AWS（Cloud9, EC2, S3）

# 実装機能
- ユーザー機能
  - deviseを使用
  - 新規登録・ログイン・ログアウト機能
  - マイページ・登録情報編集機能
- ユーザー間でのフォロー、フォロワー機能
- 都道府県に対して投稿する機能 + 画像投稿機能(carrierwave)
- いいね機能(ajax)
- 検索機能
- ゲストユーザーログイン機能
- いった都道府県が一目でわかる機能
