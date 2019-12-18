class KensController < ApplicationController
  before_action :authenticate_user!

  def show
    @ken = Ken.find_by(id:params[:id])
    @posts = @ken.posts.all
  end
end