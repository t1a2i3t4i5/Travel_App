class User < ApplicationRecord
  has_many      :posts , dependent: :destroy#ポストモデルと関連付けている
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  
end
