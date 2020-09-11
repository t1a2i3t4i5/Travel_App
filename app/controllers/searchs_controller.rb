# frozen_string_literal: true

class SearchsController < ApplicationController
  def index
    # blankだとスペースのみも空文字と判定するのでblankを使用しています
    @keyword = params[:keyword]
    @option = params[:option]
    if @option == "1"
      @result_type = "ユーザー"
      @users = User.where('name LIKE ?', "%#{@keyword}%").order(created_at: :desc)
      @users = Kaminari.paginate_array(@users).page(params[:page]).per(10)
    elsif @option == "2"
      @result_type = "投稿"
      @posts = Post.where('content LIKE ?', "%#{@keyword}%").order(created_at: :desc)
      @posts = Kaminari.paginate_array(@posts).page(params[:page]).per(9)
    elsif @option == "3"
      @result_type = "投稿"
      @posts = Post.where('place LIKE ?', "%#{@keyword}%").order(created_at: :desc)
      @posts = Kaminari.paginate_array(@posts).page(params[:page]).per(9)
    end
  end
end
