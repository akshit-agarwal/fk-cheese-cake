require 'benchmark'


class Rating < ActiveRecord::Base


  belongs_to :employees, :class_name => 'Employee', :foreign_key => :emp_id
  belongs_to :skills, :class_name => 'Skill', :foreign_key => :id
  belongs_to :skills, :class_name => 'Skill' , :foreign_key => :vertical

  class << self

    def get_ratings_info(emp_id)
      return self.find_by_emp_id(emp_id)
    end

    def give_ratings(emp_id, ref_id, comments, value, skill_id, vertical_name)
      self.create!(:emp_id => emp_id, :ref_emp_id => ref_id, :skill_id => skill_id, :points => value, :comments => comments, :vertical => vertical_name)
    end

  end

end