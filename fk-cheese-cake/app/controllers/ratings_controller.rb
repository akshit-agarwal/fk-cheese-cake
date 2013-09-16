class RatingsController < ApplicationController

  #def get_ratings(emp_name)
  #  @emp_name = params[:emp_name]
  #  rating_info = ratings.get_ratings_info(emp_name)
  #  #render
  #end

  #def get_employee
  #  puts "\n------------------------\n"
  #  puts params[:emp_name][0]
  #  puts "\n------------------------\n"
  #
  #  @emp_name = params[:emp_name]||@emp_name
  #  @employee_info = Employee.find_by_emp_name(@emp_name)
  #  id = @employee_info.emp_id
  #  @rating_info = Rating.find_by_emp_id(id)
  #  #rating_info = get_ratings(@emp_name)
  #  render
  #end

  def get_employee
    @emp_name = params[:emp_name]
    @employee_info = Employee.get_employee_info(@emp_name)
    @emp_id = @employee_info.emp_id
    @tech_ratings = Rating.find_all_by_emp_id_and_vertical(@emp_id,"TECH").collect(&:skill_id).collect{|skill_id| Skill.find_by_id(skill_id).skill_name}.uniq.inject({}) do |hash,skill_name| hash.merge( skill_name => {"points" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).sum(&:points),"comments" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).collect{|skill| skill.comments}}) end
    @communication_ratings = Rating.find_all_by_emp_id_and_vertical(@emp_id,"COMMUNICATION").collect(&:skill_id).collect{|skill_id| Skill.find_by_id(skill_id).skill_name}.uniq.inject({}) do |hash,skill_name| hash.merge( skill_name => {"points" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).sum(&:points),"comments" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).collect{|skill| skill.comments}}) end
    @tw_ratings = Rating.find_all_by_emp_id_and_vertical(@emp_id,"TEAM_WORK").collect(&:skill_id).collect{|skill_id| Skill.find_by_id(skill_id).skill_name}.uniq.inject({}) do |hash,skill_name| hash.merge( skill_name => {"points" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).sum(&:points),"comments" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).collect{|skill| skill.comments}}) end
    @cq_ratings = Rating.find_all_by_emp_id_and_vertical(@emp_id,"COOL_QUOTIENT").collect(&:skill_id).collect{|skill_id| Skill.find_by_id(skill_id).skill_name}.uniq.inject({}) do |hash,skill_name| hash.merge( skill_name => {"points" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).sum(&:points),"comments" => Rating.find_all_by_emp_id_and_skill_id(@emp_id,Skill.find_by_skill_name(skill_name).id).collect{|skill| skill.comments}}) end

    t_level  =  PointQuota.find_by_emp_id_and_vertical(@emp_id,"TECH")
    c_level  = PointQuota.find_by_emp_id_and_vertical(@emp_id,"COMMUNICATION")
    tw_level  = PointQuota.find_by_emp_id_and_vertical(@emp_id,"TEAM_WORK")
    cq_level = PointQuota.find_by_emp_id_and_vertical(@emp_id,"CQ")
    @tech_level = t_level.nil?? "Base":t_level.level
    @comm_level = c_level.nil?? "Base":c_level.level
    @tw_level = tw_level.nil??  "Base":tw_level.level
    @cq_level = cq_level.nil??  "Base":cq_level.level
     render
  end



  def get_skill_id(skill_name,vertical)
    puts skill_name
    skill_info = Skill.get_skills_info(skill_name,vertical)
    return skill_info.id
  end


  def give_ratings

    puts "\n----------\n"
    puts params
    puts "\n----------\n"

    emp_id = params[:emp_id].to_i
    value = params[:score].to_i
    skill_name = params[:skill_key].upcase
    comments = params[:comments]
    ref_emp_id = params[:ref_emp_id].to_i
    vertical = params[:vertical].upcase
    skill_id = get_skill_id(skill_name,vertical)

    Rating.give_ratings(emp_id, ref_emp_id, comments, value, skill_id,vertical)

    vertical_tot_points = Rating.find_all_by_emp_id_and_vertical(emp_id,vertical).sum(&:points)
    PointQuota.change_level(vertical, vertical_tot_points, emp_id)
    PointQuota.decrease_points(ref_emp_id, value)

    #render status: 200
    render nothing: true
  end


end
