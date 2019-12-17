class UsersController < ApplicationController
  
  def show
    @user = User.find_by(id:params[:id])
    @post = Post.new
    @posts = @user.posts.all
  end
  
end
