class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :configure_permitted_parameters, if: :devise_controller?

  # 新規登録後のリダイレクト先をマイページへ
    def after_sign_in_path_for(resource)
      if current_user
         home_pages_index_path#ユーザーページへ移動
      end
    end

  private
  #ユーザー作成時に名前を追加するためのストロングぱためーた
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name]) # 新規登録時(sign_up時)にnameというキーのパラメーターを追加で許可する
  end
end