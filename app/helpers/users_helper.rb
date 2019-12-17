module UsersHelper
  
    #postのken_idをもとにken_nameを探す
    def search_kenname(post)
      @ken = Ken.find_by(id: post.ken_id)
      if @ken
        return @ken.name
      else
        return "県名がなかったね"
      end
    end
    
    #いった県の数をカウントする
    def visited_ken_count(user)
      visited_ken = 0
      (1..47).each do |kencode|
        if user.user_ken.find_by(ken_id: kencode)
          visited_ken = visited_ken + 1
        end
      end
      return visited_ken
    end
    
end
