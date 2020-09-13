class RemoveVisitedAtFromPosts < ActiveRecord::Migration[5.1]
  def change
    remove_column :posts, :visited_at, :string
  end
end
