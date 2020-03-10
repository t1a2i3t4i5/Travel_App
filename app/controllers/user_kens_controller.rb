# frozen_string_literal: true

class UserKensController < ApplicationController
  before_action :authenticate_user!

  def create; end

  def destroy
    @user_ken = UserKen.find_by(user_id: current_user.id, ken_id: params[:ken_id])
    if @user_ken
      @user_ken.destroy
      flash[:success] = '行ってない県状態にしました'
      redirect_to ken_path(params[:ken_id])
    end
  end
end
