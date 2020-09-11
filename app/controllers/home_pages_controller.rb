# frozen_string_literal: true

class HomePagesController < ApplicationController
  def index
    # フォローしているユーザーの投稿を降順で取得
    @like = Like.new
    if user_signed_in?
      @follow_users = current_user.followings.all
      @timeline_posts = Post.where(user_id: @follow_users).or(Post.where(user_id: current_user)).order(visited_at: :desc)
      @timeline_posts = @timeline_posts.page(params[:page]).per(10)
    end
    # @created_at_desc_posts = Post.all.order(created_at: :desc)
    # @popular_posts = Post.find(Like.group(:post_id).order('count(post_id) desc').pluck(:post_id))
    # @comment_count_desc_posts = Post.find(Comment.group(:post_id).order('count(post_id) desc').pluck(:post_id))
    # @prefectures_id_asc_posts = Post.all.order(ken_id: :asc)
  end
end
