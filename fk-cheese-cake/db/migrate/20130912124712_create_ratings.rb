class CreateRatings < ActiveRecord::Migration
  def self.up
    create_table :ratings do |t|
      t.column :emp_id, :bigint, :null=>false
      t.column :ref_emp_id, :string, :limit => 20, :null=>false
      t.column :skill_id, :string, :limit => 20, :null=>false
      t.column :points, :int, :limit => 20, :null=>false
      t.column :comments, :string, :limit => 200, :null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :ratings
  end
end
