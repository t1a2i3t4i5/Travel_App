# frozen_string_literal: true

class RelationshipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user

  def create
    current_user.follow(@user)
  end

  def destroy
    current_user.unfollow(@user)
  end

  def  set_user
    @user = User.find(params[:follow_id])
    p @user
  end
end
