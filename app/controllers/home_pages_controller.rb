class HomePagesController < ApplicationController
  def index
    @post = Post.new
    if current_user
      @posts = current_user.posts.all
    end
  end
  
end
