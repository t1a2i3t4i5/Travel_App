class HomePagesController < ApplicationController
  before_action:authenticate_user!
  
  def index
    @post = Post.new
    @user_ken = UserKen.new
    @like = Like.new
  end
  
end
