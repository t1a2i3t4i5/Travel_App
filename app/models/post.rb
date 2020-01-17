class Post < ApplicationRecord
  mount_uploader :image, ImageUploader

  #acts-as-taggable-onでタグを実装するのに必要
  acts_as_taggable
  
  #ユーザがポストを投稿するときに必要
  belongs_to :user
  
  #県に対して投稿するときに必要
  belongs_to :ken 
  
  #いいね機能を実装するのに必要
  has_many :likes , dependent: :destroy
  has_many :liked_users, through: :likes, source: :user
  


end
