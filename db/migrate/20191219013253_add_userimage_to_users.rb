# frozen_string_literal: true

class AddUserimageToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :image, :string
  end
end
