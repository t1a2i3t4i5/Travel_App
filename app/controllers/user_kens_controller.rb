class UserKensController < ApplicationController
  def create
    @user_ken = current_user.user_ken.build(ken_id:params[:user_ken][:ken_id])
    if @user_ken.save
      redirect_to home_pages_index_url
    else
      redirect_to home_pages_index_url
      flash[:notice] = "できませんでした。。。"
    end
  end

  def destroy
  end
end
