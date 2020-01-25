class HomePagesController < ApplicationController
  before_action:authenticate_user!
  
  def index
    @post = Post.new
    @user_ken = UserKen.new
    @like = Like.new
    
    #フォローしているユーザーの投稿を降順で取得
    @follow_users = current_user.followings.all
    @posts = Post.where(user_id: @follow_users).order(created_at: :desc)
  end
  
end
