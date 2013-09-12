class RatingsController

  def get_ratings(emp_name)
    #@emp_name = params[:emp_name]
    rating_info = ratings.get_ratings_info(emp_name)
    #render
  end

  def get_employee
    @emp_name = params[:emp_name]
    employee_info = employees.get_employee_info(@emp_name)
    rating_info = get_ratings(@emp_name)
    #render
  end

  def get_skills
    @skill_name = params[:skill_name]
    skill_info = skills.get_skills_info(@skill_name)
    render
  end

  def get_points(emp_id)
    point_info = points_quota.get_points_quota_info(emp_id)
    render
  end

  def give_ratings
    @emp_id = params[:emp_id]
    @ref_id = params[:ref_id]
    @value = params[:value]
    @comments = params[:comments]
    @skill_id = params[:skill_id]
    ratings.give_ratings(@emp_id, @ref_id, @comments, @value, @skill_id)
    point_quota.decrease_points(@ref_id, @value)
  end

  end
