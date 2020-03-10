# frozen_string_literal: true

class UserKen < ApplicationRecord
  belongs_to :user
  belongs_to :ken
  validates_uniqueness_of :user_id, scope: :ken_id
end
