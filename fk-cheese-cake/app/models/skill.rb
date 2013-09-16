require 'benchmark'



class Skill < ActiveRecord::Base

  has_many :ratings
  class << self

    def get_skills_info(skill_name,vertical)
      skill_info = self.find_by_skill_name(skill_name)
      skill_info.nil?? add_skills(skill_name, vertical):skill_info
    end

    def add_skills(skill_name, vertical)
      self.create!(:skill_name => skill_name, :vertical => vertical)
    end

  end

end