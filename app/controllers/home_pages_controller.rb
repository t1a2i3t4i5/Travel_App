# frozen_string_literal: true

class HomePagesController < ApplicationController
  before_action :authenticate_user!

  def index
    @like = Like.new

    # フォローしているユーザーの投稿を降順で取得
    @follow_users = current_user.followings.all
    @posts = Post.where(user_id: @follow_users).or(Post.where(user_id: current_user)).order(visited_at: :desc)
  end
end
