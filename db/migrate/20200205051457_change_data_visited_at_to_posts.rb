# frozen_string_literal: true

class ChangeDataVisitedAtToPosts < ActiveRecord::Migration[5.1]
  def change
    change_column :posts, :visited_at, :string
  end
end
