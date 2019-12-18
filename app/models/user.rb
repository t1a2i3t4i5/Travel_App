class User < ApplicationRecord
  has_many  :posts , dependent: :destroy#ポストモデルと関連付けている
  has_many  :user_ken, dependent: :destroy
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  
end