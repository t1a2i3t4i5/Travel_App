class HomePagesController < ApplicationController
  
  def index
    @post = Post.new
    @user_ken = UserKen.new
    if current_user
      @posts = current_user.posts.all
    end
  end
  
end
