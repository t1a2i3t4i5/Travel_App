# frozen_string_literal: true

class Post < ApplicationRecord
  mount_uploader :image, ImageUploader

  # バリデーション
  validates :content,
            presence: true,
            length: { in: 1..140 }

  validates :user_id, presence: true
  validates :image, presence: true
  validates :place, presence: true
  validate :check_content

  # acts-as-taggable-onでタグを実装するのに必要
  acts_as_taggable

  # ユーザがポストを投稿するときに必要
  belongs_to :user

  # 県に対して投稿するときに必要
  belongs_to :ken

  # いいね機能を実装するのに必要
  has_many :likes, dependent: :destroy
  has_many :liked_users, through: :likes, source: :user

  # comment機能の関連付け
  has_many :comments, dependent: :destroy

  # バリデーション
  def check_content
    eros = %w[sex ちんこ まんこ おっぱい]
    flg = 0
    eros.each do |ero|
      flg += 1 if content.include?(ero)
    end

    errors.add(:content, 'にはエッチな単語は使用できないよ') if flg.positive?
  end
end
