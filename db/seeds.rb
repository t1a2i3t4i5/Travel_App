# frozen_string_literal: true

# 県を一瞬で作成する
unless Ken.first
  kens = %w[北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県]
  kens.each do |ken|
    Ken.create!(name: ken)
  end
end

# ゲストユーザー作成
guest_user = User.find_by(email: "guest@example.com")

User.create!(email: "guest@example.com", password: "guest1", name: "ゲスト") unless guest_user

if User.count < 10
  100.times do |_n|
    name = Faker::Name.name
    email = Faker::Internet.email
    password = "password"
    User.create!(name: name,
                 email: email,
                 password: password,
                 password_confirmation: password)
  end
end

if Post.count < 10
  100.times do |_n|
    content = "hogehoge"
    user_id = 1
    ken_id = 1
    place = "hogehoge"
    visited_at = "2020-08-25"
    Post.create!(content: content,
                user_id: user_id,
                ken_id: ken_id,
                place: place,
                image: open("./app/assets/images/default.jpg"),
                visited_at: visited_at)
  end
end