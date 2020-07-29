# frozen_string_literal: true

class TagsController < ApplicationController
  def show
    @like = Like.new
    @tag_name = params[:tag_name]
    @posts = Post.tagged_with(params[:tag_name].to_s)
  end
end
