# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = User.find_by(id: params[:id])
    @post = Post.new
    @posts = @user.posts.all.order(created_at: :desc)
    @user_liked_posts = @user.liked_posts.order(created_at: :desc)
    @following = @user.followings.all
    @followes = @user.followers.all
  end

  # 投稿を全部削除する
  def posts_reset
    current_user.posts.destroy_all
    flash[:success] = '投稿全部削除しました'
    redirect_to edit_user_registration_url
  end

  # すべての県を行ったことない状態にする
  def prefecture_reset
    current_user.user_ken.destroy_all
    flash[:success] = 'すべての都道府県を行ったことない状態にしました'
    redirect_to edit_user_registration_url
  end

  def following
    @title = 'のフォロー一覧'
    @user  = User.find(params[:id])
    @users = @user.followings.all
    render 'show_follow'
  end

  def followers
    @title = 'のフォロワー一覧'
    @user  = User.find(params[:id])
    @users = @user.followers.all
    render 'show_follow'
  end
end
