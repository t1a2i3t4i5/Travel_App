class KensController < ApplicationController
  def show
    @ken = Ken.find_by(id:params[:id])
    @posts = @ken.posts.all
  end
end
