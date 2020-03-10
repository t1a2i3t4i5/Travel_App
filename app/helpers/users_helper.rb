# frozen_string_literal: true

module UsersHelper
  # postのken_idをもとにken_nameを探す
  def search_kenname(post)
    @ken = Ken.find_by(id: post.ken_id)
    if @ken
      @ken.name
    else
      '県名がなかったね'
    end
  end

  # いった県の数をカウントする
  def visited_ken_count(user)
    visited_ken = 0
    (1..47).each do |kencode|
      visited_ken += 1 if user.user_ken.find_by(ken_id: kencode)
    end
    visited_ken
  end
end
