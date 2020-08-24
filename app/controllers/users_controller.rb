# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :authenticate_user!, except: [:show]

  def show
    # ユーザー指定
    @user = User.find_by(id: params[:id])
    # @userの投稿を全て取得
    @posts = @user.posts.all.order(created_at: :desc)
    # @userのいいねした投稿を全て取得
    @user_liked_posts = @user.liked_posts.order(created_at: :desc)
    # @userのフォローしているユーザー全て取得
    @followings_users = @user.followings.all
    # @userをフォローしているユーザー全て取得
    @followers_users = @user.followers.all
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
    @user  = User.find(params[:id])
    @users = @user.followings.all
    render 'show_follow'
  end

  def followers
    @user  = User.find(params[:id])
    @users = @user.followers.all
    render 'show_follow'
  end
end
