require 'benchmark'


class PointQuota  < ActiveRecord::Base

  belongs_to :employees, :class_name => 'Employee', :foreign_key => :emp_id
  belongs_to :skills, :class_name => 'Skill', :foreign_key => :vertical
  class << self

    def get_points_quota_info

      return self.find(id).to_json

    end

    def decrease_points(ref_id, value)
      existing = self.find_by_emp_id(ref_id).quota
      sum = existing - value
      self.find_by_emp_id(ref_id).update_attributes!(:quota => sum)
    end

    def change_level(vertical_name, vertical_points, emp_id)
      if (self.find_by_emp_id_and_vertical(emp_id, vertical_name) != nil)
        if vertical_points >15 && vertical_points <25
          lev = "BRONZE"
        elsif vertical_points >=25 && vertical_points < 40
          lev = "SILVER"
        elsif vertical_points>=40
          lev = "GOLD"
        end
        if (self.find_by_emp_id_and_vertical(emp_id, vertical_name).level != lev)
          self.find_by_emp_id_and_vertical(emp_id, vertical_name).update_attributes!(:level => lev)
          new_quota= self.find_by_emp_id(emp_id).quota + 10
          self.find_by_emp_id(emp_id).update_attributes(:quota => new_quota)
        end
      else
        self.create!(:emp_id => emp_id, :quota => 10, :vertical => vertical_name, :level => 'BASE')
      end
    end

  end

end