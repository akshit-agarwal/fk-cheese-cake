# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130912124803) do

  create_table "employees", :force => true do |t|
    t.integer  "emp_id",      :limit => 8,  :null => false
    t.string   "emp_name",    :limit => 20, :null => false
    t.string   "designation", :limit => 20, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "point_quota", :force => true do |t|
    t.integer  "emp_id",     :limit => 8,  :null => false
    t.integer  "quota",                    :null => false
    t.string   "vertical",   :limit => 20, :null => false
    t.string   "level",      :limit => 20, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "ratings", :force => true do |t|
    t.integer  "emp_id",     :limit => 8,   :null => false
    t.string   "ref_emp_id", :limit => 20,  :null => false
    t.string   "skill_id",   :limit => 20,  :null => false
    t.integer  "points",                    :null => false
    t.string   "comments",   :limit => 200, :null => false
    t.string   "vertical",   :limit => 20
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "skills", :force => true do |t|
    t.string   "skill_name", :limit => 20, :null => false
    t.string   "vertical",   :limit => 20, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
