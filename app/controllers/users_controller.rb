# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :authenticate_user!, only: %i[posts_reset prefecture_reset]
  before_action :set_user, except: %i[posts_reset prefecture_reset]

  def show
    # @userの投稿を全て取得
    @posts = @user.posts.all.order(created_at: :desc)
    @posts = @posts.page(params[:page]).per(9)
  end

  def liked_posts
    # @userのいいねした投稿を全て取得
    @liked_posts = @user.liked_posts.order(created_at: :desc)
    @liked_posts = @liked_posts.page(params[:page]).per(9)
    render 'users/show' unless request.xhr?
  end

  def followings
    # @userのフォローしているユーザー全て取得
    @followings_user = @user.followings.all
    @followings_user = @followings_user.page(params[:page]).per(10)
    render 'users/show' unless request.xhr?
  end

  def followers
    # @userをフォローしているユーザー全て取得
    @followers_user = @user.followers.all
    @followers_user = @followers_user.page(params[:page]).per(10)
    render 'users/show' unless request.xhr?
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

  private

  def set_user
    # ユーザー指定
    @user = User.find_by(id: params[:id])
  end
end
