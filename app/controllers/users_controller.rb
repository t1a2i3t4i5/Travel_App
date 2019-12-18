class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = User.find_by(id:params[:id])
    @post = Post.new
    @posts = @user.posts.all
  end
  
end
