# frozen_string_literal: true

class CreateKens < ActiveRecord::Migration[5.1]
  def change
    create_table :kens do |t|
      t.string :name

      t.timestamps
    end
  end
end
