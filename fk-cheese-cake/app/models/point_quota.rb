require 'benchmark'

belongs_to :employees, :class_name => 'Employees', :foreign_key => :emp_id

class PointsQuota  < ActiveRecord :: Base

  class << self

    def get_points_quota_info

      return self.find(id).to_json

    end

    def decrease_points(ref_id, value)
      existing = self.find_by_emp_id(ref_id).quota
      sum = existing + value
      self.find_by_emp_id(ref_id).update_attributes!(:quota => sum)
    end

  end

end