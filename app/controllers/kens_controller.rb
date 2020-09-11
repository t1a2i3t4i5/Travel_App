# frozen_string_literal: true

class KensController < ApplicationController
  def show
    @ken = Ken.find_by(id: params[:id])
    @posts = @ken.posts.all.order(created_at: :desc)
    @posts = @posts.page(params[:page]).per(9)
    @user_ken = UserKen.find_by(user_id: current_user.id, ken_id: @ken.id) if user_signed_in?
  end
end
