class RenameIntroducitonColumnToUsers < ActiveRecord::Migration[5.1]
  def change
    rename_column :users, :introduciton, :introduction
  end
end
