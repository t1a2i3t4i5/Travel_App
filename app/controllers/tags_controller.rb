class TagsController < ApplicationController
  def show
    @like = Like.new
    if params[:tag_name]
      @tag_name = params[:tag_name]
      @posts = Post.tagged_with("#{params[:tag_name]}")
    end
  end
end
