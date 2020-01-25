class PostsController < ApplicationController
  before_action :authenticate_user!
  before_action :followings_user_posts, only: :create

  def new
    @post = Post.new
  end
  
  def create
    @post = current_user.posts.build(post_params)
    @user_ken = current_user.user_ken.build(ken_id:params[:post][:ken_id])

    if @user_ken.save && @post.save
      flash[:success] = "ポストが作成され行った県状態にしました"
      redirect_to ken_path(@post.ken_id)
    elsif (@user_ken.save == false) && @post.save
      flash[:success] = "行ったことある県だからポストだけ作成したよ"
      redirect_to ken_path(@post.ken_id)
    else
      flash[:danger] = "ポストが作成されませんでした"
      render 'home_pages/index', object: @posts
    end
  end
  
  def destroy
    @post = Post.find_by(id: params[:id])
    @post.destroy
    flash[:success] ="ポストを削除しました"
    redirect_back(fallback_location: root_path)
  end

  private

  def post_params
    params.require(:post).permit(:ken_id, :content, :tag_list, [:image])
  end
  
  def followings_user_posts
    @follow_users = current_user.followings.all
    @posts = Post.where(user_id: @follow_users).order(created_at: :desc)
  end

  
end
