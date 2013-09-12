require 'benchmark'

has_many :ratings
has_many :point_quota


class Employees < ActiveRecord :: Base

  class << self

    def get_employee_info(emp_name)
      return self.find(emp_name).to_json
    end

  end

end