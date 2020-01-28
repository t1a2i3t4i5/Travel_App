class SearchsController < ApplicationController

  def index
    @keyword = params[:keyword]
    @users = User.where(['name LIKE ?', "%#{@keyword}%"]).order(created_at: :desc)
    @posts = Post.where(['content LIKE ?', "%#{@keyword}%"]).order(created_at: :desc)
  end



end
