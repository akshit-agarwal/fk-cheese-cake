class HomeController < ApplicationController

  def home
    @all_employee = Employee.select("emp_id,emp_name,designation")
    render
  end
end