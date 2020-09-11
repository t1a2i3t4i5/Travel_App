# frozen_string_literal: true

class TagsController < ApplicationController
  def show
    @like = Like.new
    @tag_name = params[:tag_name]
    @posts = Post.tagged_with(params[:tag_name].to_s)
    @posts = @posts.page(params[:page]).per(9)
  end
end
