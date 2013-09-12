require 'benchmark'

belongs_to :employees, :class_name => 'Employees', :foreign_key => :emp_id
belongs_to :skills, :class_name => 'Skills', :foreign_key => :id

class Ratings  < ActiveRecord :: Base

  class << self

    def get_ratings_info(id)

      return self.find(id).to_json

    end

    def give_ratings(emp_id, ref_id, comments, value, skill_id)
       self.create!(:emp_id => emp_id, :ref_emp_id => ref_id, :skill_id => skill_id, :points => value, :comments => comments)
    end

  end

end