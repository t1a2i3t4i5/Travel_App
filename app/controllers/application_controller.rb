class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :configure_permitted_parameters, if: :devise_controller?

  # 新規登録後のリダイレクト先をマイページへ
    def after_sign_in_path_for(resource)
      home_pages_index_path if current_user
    end

  private
 
  def configure_permitted_parameters 
    #ユーザー作成時に名前を追加するためのストロングぱためーた
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name , :image]) # 新規登録時(sign_up時)にnameとimageキーのパラメーターを追加で許可する
    # アカウント編集の時にnameとimageのストロングパラメータを追加
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :image])
  end
  
end
