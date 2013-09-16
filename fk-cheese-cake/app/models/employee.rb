require 'benchmark'

class Employee < ActiveRecord::Base

  has_many :ratings
  has_many :point_quota

  class << self

    def get_employee_info(emp_name)
      return self.find_by_emp_name(emp_name)
    end

  end

end