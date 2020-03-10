# frozen_string_literal: true

class CreateUserKens < ActiveRecord::Migration[5.1]
  def change
    create_table :user_kens do |t|
      t.references :user, foreign_key: true
      t.references :ken, foreign_key: true

      t.timestamps
    end
  end
end
