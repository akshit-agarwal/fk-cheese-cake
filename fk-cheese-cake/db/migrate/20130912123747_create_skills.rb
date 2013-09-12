class CreateSkills < ActiveRecord::Migration
  def self.up
    create_table :skills do |t|
      t.column :skill_name, :string, :limit => 20, :null=>false
      t.column :vertical, :string, :limit => 20, :null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :skills
  end
end
