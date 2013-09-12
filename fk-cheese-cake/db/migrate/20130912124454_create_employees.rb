class CreateEmployees < ActiveRecord::Migration
  def self.up
    create_table :employees do |t|
      t.column :emp_id, :bigint, :null=>false
      t.column :emp_name, :string, :limit => 20, :null=>false
      t.column :designation, :string, :limit => 20, :null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :employees
  end
end
