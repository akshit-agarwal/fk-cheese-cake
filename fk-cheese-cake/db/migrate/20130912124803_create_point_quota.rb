class CreatePointQuota < ActiveRecord::Migration
  def self.up
    create_table :point_quota do |t|
      t.column :emp_id, :bigint, :null=>false
      t.column :quota, :int, :limit => 20, :null=>false
      t.column :category, :string, :limit => 20, :null=>false
      t.column :level, :string, :limit => 20, :null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :point_quota
  end
end
