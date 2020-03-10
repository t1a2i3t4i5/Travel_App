# frozen_string_literal: true

class AddkenRefToPosts < ActiveRecord::Migration[5.1]
  def change
    add_reference :posts, :ken, index: true
  end
end
