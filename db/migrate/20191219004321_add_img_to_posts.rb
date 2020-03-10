# frozen_string_literal: true

class AddImgToPosts < ActiveRecord::Migration[5.1]
  def change
    add_column :posts, :image, :string
  end
end
