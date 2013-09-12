require 'benchmark'

has_many :ratings

class Skills < ActiveRecord :: Base

  class << self

    def get_skills_info(id)
      return self.find(id).to_json
    end

    def add_skills(skill_name, vertical)
      self.create!(:skill_name => skill_name, :vertical => vertical)
    end

  end

end