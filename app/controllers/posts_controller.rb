# frozen_string_literal: true

class PostsController < ApplicationController
  before_action :authenticate_user!

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
