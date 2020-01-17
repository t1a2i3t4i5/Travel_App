class PostsController < ApplicationController
  before_action :authenticate_user!

  def new
    @post = Post.new
  end
  
  def create
    @post = current_user.posts.build(post_params)
    @user_ken = current_user.user_ken.build(ken_id:params[:post][:ken_id])

    if @post.save && @user_ken.save
      flash[:success] = "ポストが作成され行った県状態にしました"
      redirect_to ken_path(@post.ken_id)
    else
      flash[:danger] = "ポストが作成されませんでした"
      redirect_to home_pages_index_url
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
    params.require(:post).permit(:ken_id, :content, :tag_list, :image)
  end

  
end
