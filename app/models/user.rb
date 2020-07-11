# frozen_string_literal: true

class User < ApplicationRecord
  # 画像投稿の時に必要
  mount_uploader :image, ImageUploader

  validate :check_name

  # ポストモデルと関連付けている
  has_many  :posts, dependent: :destroy

  # ユーザーが行った県の時に必要
  has_many  :user_ken, dependent: :destroy

  # いいね機能の時の関連付け
  has_many :posts, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :liked_posts, through: :likes, source: :post

  # フォロー機能
  has_many :relationships, dependent: :destroy
  has_many :followings, through: :relationships, source: :follow, dependent: :destroy
  has_many :reverse_of_relationships, class_name: 'Relationship', foreign_key: 'follow_id', dependent: :destroy
  has_many :followers, through: :reverse_of_relationships, source: :user, dependent: :destroy

  # deviseの設定
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  def follow(other_user)
    relationships.find_or_create_by(follow_id: other_user.id) unless self == other_user
  end

  def unfollow(other_user)
    relationship = relationships.find_by(follow_id: other_user.id)
    relationship&.destroy
  end

  def following?(other_user)
    followings.include?(other_user)
  end

  # すでにいいねしているかの判定
  def already_liked?(post)
    likes.exists?(post_id: post.id)
  end

  # deviseのパスワードだけ変更できない問題を解決してくれたメソッド
  def update_without_current_password(params, *options)
    params.delete(:current_password)

    if params[:password].blank? && params[:password_confirmation].blank?
      params.delete(:password)
      params.delete(:password_confirmation)
    end

    result = update_attributes(params, *options)
    clean_up_passwords
    result
  end

  # バリデーション
  def check_name
    eros = %w[sex ちんこ まんこ おっぱい]
    flg = 0
    eros.each do |ero|
      flg += 1 if name == ero
    end

    errors.add(:name, 'にはエッチな単語は使用できないよ') if flg.positive?
  end
end
