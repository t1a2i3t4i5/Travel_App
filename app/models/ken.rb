class Ken < ApplicationRecord
  has_many :user_ken
  has_many :posts
end