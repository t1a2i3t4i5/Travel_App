# frozen_string_literal: true

class AddDetailsToPosts < ActiveRecord::Migration[5.1]
  def change
    add_column :posts, :place, :string
    add_column :posts, :visited_at, :string
  end
end
