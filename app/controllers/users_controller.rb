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
  
  
  #投稿を全部削除する
  def posts_reset
    current_user.posts.destroy_all
    flash[:success] = "投稿全部削除したぜ"
    redirect_to edit_user_registration_url
  end
  
  #すべての県を行ったことない状態にする
  def prefecture_reset
    current_user.user_ken.destroy_all
    flash[:success] = "すべての都道府県を行ったことない状態にしたぜ"
    redirect_to edit_user_registration_url
  end
  
end
