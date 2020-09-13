# frozen_string_literal: true

class PostsController < ApplicationController
  before_action :authenticate_user!, only: %i[new edit create destroy]

  def index
    return unless user_signed_in?

    @like = Like.new
    @follow_users = current_user.followings.all
    @timeline_posts = Post.where(user_id: @follow_users).or(Post.where(user_id: current_user)).order(visited_at: :desc)
    @timeline_posts = @timeline_posts.page(params[:page]).per(10)
  end

  def new_arrival
    @new_arrival_posts = Post.all.order(created_at: :desc)
    @new_arrival_posts = @new_arrival_posts.page(params[:page]).per(10)
    render 'posts/index' unless request.xhr?
  end

  def popular
    @popular_posts = Post.find(Like.group(:post_id).order('count(post_id) desc').pluck(:post_id))
    @popular_posts = Kaminari.paginate_array(@popular_posts).page(params[:page]).per(10)
    render 'posts/index' unless request.xhr?
  end

  def liked_users
    @post = Post.find_by(id: params[:id])
    @users = @post.liked_users
  end

  def commented_users
    @post = Post.find_by(id: params[:id])
    @users = @post.commented_users.distinct
  end

  def new
    @post = Post.new
  end

  def show
    @post = Post.find_by(id: params[:id])
    @comment = Comment.new
    @comments = @post.comments.order(created_at: :desc)
  end

  def edit
    @post = Post.find_by(id: params[:id])
  end

  def create
    @post = current_user.posts.build(post_params)
    @user_ken = current_user.user_ken.build(ken_id: params[:post][:ken_id])
    if @user_ken.save && @post.save
      flash[:success] = '投稿が作成され行った県状態にしました'
      redirect_to ken_path(@post.ken_id)
    elsif (@user_ken.save == false) && @post.save
      flash[:success] = '行ったことある県だから投稿だけ作成したよ'
      redirect_to ken_path(@post.ken_id)
    else
      flash[:danger] = '投稿が作成されませんでした'
      redirect_back(fallback_location: root_path)
    end
  end

  def destroy
    @post = Post.find_by(id: params[:id])
    @post.destroy
    flash[:success] = '投稿を削除しました'
    redirect_to user_path(current_user)
  end

  private

  def post_params
    params.require(:post).permit(:ken_id, :content, :tag_list, :image, :visited_at, :place)
  end
end
