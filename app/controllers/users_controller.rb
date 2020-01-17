class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = User.find_by(id:params[:id])
    @post = Post.new
    @posts = @user.posts.all.order(created_at: :desc)
    @user_liked_posts =  @user.liked_posts.order(created_at: :desc)
    @FollowingCount = @user.followings.all.count
    @FollowesCount = @user.followers.all.count
    @following = @user.followings.all
    @followes = @user.followers.all
  end
  
end
