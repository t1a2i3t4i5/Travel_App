class UserKensController < ApplicationController
  before_action :authenticate_user!

  def create
    @user_ken = current_user.user_ken.build(ken_id:params[:user_ken][:ken_id])
    if @user_ken.save
      flash[:success] = "#{params[:user_ken][:ken_name]}を行ったことにしました"
      redirect_to home_pages_index_url
    else
      flash[:danger] = "できませんでした。。。"
      redirect_to home_pages_index_url
    end
  end

  def destroy
  end
end
